import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import worker from '../worker/index.js';

// Real signatures with temporary keys; only the public-key HTTP response and
// storage are simulated. These tests never contact Cloudflare or the live DB.
test('production Access verification and request boundaries', async t => {
  const trusted = await generateKeyPair('RS256');
  const attacker = await generateKeyPair('RS256');
  const publicKey = { ...await exportJWK(trusted.publicKey), kid: 'trusted-key', alg: 'RS256', use: 'sig' };
  const issuer = 'https://review-tests.cloudflareaccess.com';
  const origin = 'https://reviews.example.com';
  const settings = {
    LOCAL_REVIEW_MODE: 'false', TEAM_DOMAIN: issuer,
    POLICY_AUD: 'test-application', ALLOWED_HOSTNAME: 'reviews.example.com',
    LOCAL_ADMIN_TOKEN: 'must-not-work-in-production',
  };
  let keyRequests = 0;
  t.mock.method(globalThis, 'fetch', async url => {
    keyRequests++;
    if (String(url) === 'https://offline.cloudflareaccess.com/cdn-cgi/access/certs') throw new Error('offline');
    assert.equal(String(url), `${issuer}/cdn-cgi/access/certs`);
    return Response.json({ keys: [publicKey] });
  });

  const now = Math.floor(Date.now() / 1000);
  async function sign(changes = {}, key = trusted.privateKey, header = {}) {
    return new SignJWT({ iss: issuer, aud: 'test-application', sub: 'test-user', exp: now + 300, iat: now, ...changes })
      .setProtectedHeader({ alg: 'RS256', kid: 'trusted-key', ...header }).sign(key);
  }
  const valid = await sign();
  function environment(overrides = {}) {
    const calls = { assets: 0, reads: 0, writes: 0 };
    return {
      calls,
      env: {
        ...settings,
        ASSETS: { fetch: async () => { calls.assets++; return new Response('admin page'); } },
        DB: { prepare: () => ({ bind: () => ({
          all: async () => { calls.reads++; return { results: [] }; },
          run: async () => { calls.writes++; return { meta: { changes: 1 } }; },
        }) }) },
        ...overrides,
      },
    };
  }
  function request(path, token, method = 'GET', extraHeaders = {}, base = origin) {
    return new Request(base + path, {
      method,
      headers: {
        ...(token ? { 'Cf-Access-Jwt-Assertion': token } : {}),
        ...(method === 'PATCH' ? { Origin: origin, 'Content-Type': 'application/json' } : {}),
        ...extraHeaders,
      },
      ...(method === 'PATCH' ? { body: JSON.stringify({ status: 'approved' }) } : {}),
    });
  }

  await t.test('valid signatures allow pages, private lists, and moderation; cache public keys', async () => {
    const { env, calls } = environment();
    const page = await worker.fetch(request('/admin/reviews/', valid), env);
    assert.equal(page.status, 200);
    assert.equal(page.headers.get('Cache-Control'), 'no-store');
    assert.equal(page.headers.get('X-Robots-Tag'), 'noindex, nofollow');
    assert.equal((await worker.fetch(request('/api/admin/reviews?status=pending', valid), env)).status, 200);
    assert.equal((await worker.fetch(request('/api/admin/reviews/1', valid, 'PATCH'), env)).status, 200);
    assert.deepEqual(calls, { assets: 1, reads: 1, writes: 1 });
    assert.equal(keyRequests, 1);
  });

  const badTokens = [
    ['missing', undefined],
    ['malformed', 'not-a-token'],
    ['wrong signature', await sign({}, attacker.privateKey)],
    ['wrong issuer', await sign({ iss: 'https://attacker.example' })],
    ['wrong audience', await sign({ aud: 'other-application' })],
    ['expired', await sign({ exp: now - 1 })],
    ['missing expiry', await sign({ exp: undefined })],
    ['not active yet', await sign({ nbf: now + 300 })],
    ['missing subject', await sign({ sub: undefined })],
    ['unknown signing key', await sign({}, trusted.privateKey, { kid: 'unknown' })],
    ['unsigned', `${valid.split('.').slice(0, 2).join('.')}.`],
    ['wrong algorithm', await new SignJWT({ iss: issuer, aud: 'test-application', sub: 'user', exp: now + 300 })
      .setProtectedHeader({ alg: 'HS256' }).sign(new TextEncoder().encode('an-attacker-controlled-secret-value'))],
  ];
  for (const [name, token] of badTokens) {
    await t.test(`refuses ${name} token before any assets or database access`, async () => {
      const { env, calls } = environment();
      for (const path of ['/admin', '/admin/reviews', '/admin/reviews/', '/api/admin', '/api/admin/reviews']) {
        assert.equal((await worker.fetch(request(path, token), env)).status, 401, path);
      }
      assert.equal((await worker.fetch(request('/api/admin/reviews/1', token, 'PATCH'), env)).status, 401);
      assert.deepEqual(calls, { assets: 0, reads: 0, writes: 0 });
    });
  }
  await t.test('encoded and unusual admin paths cannot bypass authentication', async () => {
    const { env, calls } = environment();
    for (const path of ['/%61dmin/reviews', '/admin%2freviews', '//admin/reviews', '/api/%61dmin/reviews', '/admin%5creviews', '/foo/%2e%2e/admin/reviews', '/ADMIN/reviews', '/API/ADMIN/reviews']) {
      assert.equal((await worker.fetch(request(path), env)).status, 401, path);
    }
    for (const path of ['/%2561dmin/reviews', '/admin/%ZZ']) {
      assert.equal((await worker.fetch(request(path), env)).status, 400);
    }
    assert.deepEqual(calls, { assets: 0, reads: 0, writes: 0 });
  });
  await t.test('local key, cookie, and identity headers cannot substitute for signed proof', async () => {
    const { env, calls } = environment();
    assert.equal((await worker.fetch(request('/api/admin/reviews', undefined, 'GET', {
      Authorization: 'Bearer must-not-work-in-production',
      Cookie: `CF_Authorization=${valid}`, 'Cf-Access-Authenticated-User-Email': 'admin@example.com',
    }), env)).status, 401);
    assert.deepEqual(calls, { assets: 0, reads: 0, writes: 0 });
  });
  await t.test('unexpected hosts and insecure requests fail even with a valid token', async () => {
    const { env, calls } = environment();
    for (const base of ['https://other.workers.dev', 'https://preview.example.com', 'http://reviews.example.com', 'https://reviews.example.com:8443']) {
      for (const path of ['/', '/admin/reviews', '/api/admin/reviews']) {
        assert.equal((await worker.fetch(request(path, valid, 'GET', {
          Host: settings.ALLOWED_HOSTNAME, 'X-Forwarded-Host': settings.ALLOWED_HOSTNAME,
        }, base), env)).status, 403);
      }
    }
    assert.deepEqual(calls, { assets: 0, reads: 0, writes: 0 });
  });
  await t.test('missing or invalid production settings deny access', async () => {
    for (const overrides of [
      { TEAM_DOMAIN: undefined }, { TEAM_DOMAIN: 'http://review-tests.cloudflareaccess.com' },
      { TEAM_DOMAIN: 'https://attacker.example' }, { TEAM_DOMAIN: `${issuer}/unexpected` },
      { POLICY_AUD: '' }, { ALLOWED_HOSTNAME: '' }, { LOCAL_REVIEW_MODE: undefined },
    ]) {
      const { env, calls } = environment(overrides);
      assert.equal((await worker.fetch(request('/api/admin/reviews', valid), env)).status, 503);
      assert.equal((await worker.fetch(request('/admin/reviews', valid), env)).status, 503);
      assert.deepEqual(calls, { assets: 0, reads: 0, writes: 0 });
    }
  });
  await t.test('verification-key network failures deny access', async () => {
    const { env, calls } = environment({ TEAM_DOMAIN: 'https://offline.cloudflareaccess.com' });
    assert.equal((await worker.fetch(request('/admin/reviews', valid), env)).status, 401);
    assert.deepEqual(calls, { assets: 0, reads: 0, writes: 0 });
  });
  await t.test('cross-origin moderation fails even with a valid token', async () => {
    const { env, calls } = environment();
    assert.equal((await worker.fetch(request('/api/admin/reviews/1', valid, 'PATCH', { Origin: 'https://attacker.example' }), env)).status, 403);
    const missingOrigin = request('/api/admin/reviews/1', valid, 'PATCH');
    missingOrigin.headers.delete('Origin');
    assert.equal((await worker.fetch(missingOrigin, env)).status, 403);
    assert.equal(calls.writes, 0);
  });
  await t.test('homepage stays public but hosted public reviews remain closed', async () => {
    const { env, calls } = environment();
    assert.equal((await worker.fetch(request('/'), env)).status, 200);
    assert.equal((await worker.fetch(request('/api/reviews'), env)).status, 503);
    assert.equal((await worker.fetch(new Request(`${origin}/api/reviews`, { method: 'POST', headers: { Origin: origin } }), env)).status, 503);
    assert.equal(calls.reads + calls.writes, 0);
  });
  await t.test('local key works only with explicit local mode and local hostname', async () => {
    const { env, calls } = environment({ LOCAL_REVIEW_MODE: 'true' });
    assert.equal((await worker.fetch(request('/api/admin/reviews', undefined, 'GET', {
      Authorization: 'Bearer must-not-work-in-production',
    }, 'http://127.0.0.1:8787'), env)).status, 200);
    assert.equal((await worker.fetch(request('/admin/reviews', undefined, 'GET', {}, 'http://127.0.0.1:8787'), env)).status, 200);
    assert.equal((await worker.fetch(request('/api/admin/reviews', valid), env)).status, 503);
    assert.equal(calls.reads, 1);
  });
});
