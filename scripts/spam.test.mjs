import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.js';

const origin = 'https://reviews.example.com';
const sample = { name: 'Test visitor', rating: 5, comment: 'Temporary review for automated testing.', submissionId: '12345678-1234-4234-8234-123456789abc', turnstileToken: 'test-token' };
function setup(overrides = {}) {
  const calls = { writes: 0, reads: 0, limits: [] };
  const env = {
    LOCAL_REVIEW_MODE: 'false', TEAM_DOMAIN: 'https://review-tests.cloudflareaccess.com',
    POLICY_AUD: 'test-app', ALLOWED_HOSTNAME: 'reviews.example.com',
    PUBLIC_REVIEWS_ENABLED: 'true', TURNSTILE_SITE_KEY: 'public-test-key', TURNSTILE_SECRET_KEY: 'private-test-key',
    REVIEW_SUBMISSIONS: { limit: async input => { calls.limits.push(input); return { success: true }; } },
    DB: { prepare: sql => ({ bind: (...values) => ({
      run: async () => { calls.writes++; assert.match(sql, /INSERT INTO reviews/); assert.deepEqual(values, [sample.submissionId, sample.name, sample.rating, sample.comment]); return {}; },
      all: async () => { calls.reads++; assert.equal(values[0], 'approved'); return { results: [] }; },
    }) }) },
    ...overrides,
  };
  return { env, calls };
}
function request(body = sample, headers = {}, path = '/api/reviews', method = 'POST') {
  return new Request(origin + path, {
    method,
    headers: { Origin: origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.10', ...headers },
    ...(method === 'POST' ? { body: JSON.stringify(body) } : {}),
  });
}
function verification(t, result = { success: true, hostname: 'reviews.example.com', action: 'review-submit' }) {
  return t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), { secret: 'private-test-key', response: 'test-token', remoteip: '192.0.2.10' });
    return Response.json(result);
  });
}

test('production config returns only public widget settings; reads only approved reviews', async () => {
  const { env, calls } = setup();
  const config = await worker.fetch(request(undefined, {}, '/api/reviews/config', 'GET'), env);
  assert.deepEqual(await config.json(), { turnstileRequired: true, siteKey: 'public-test-key' });
  assert.deepEqual(await (await worker.fetch(request(undefined, {}, '/api/reviews', 'GET'), env)).json(), { reviews: [], next: null });
  assert.equal(calls.reads, 1);
});

for (const [name, overrides] of [
  ['disabled switch', { PUBLIC_REVIEWS_ENABLED: 'false' }],
  ['missing site key', { TURNSTILE_SITE_KEY: '' }],
  ['missing secret', { TURNSTILE_SECRET_KEY: '' }],
  ['missing limiter', { REVIEW_SUBMISSIONS: undefined }],
]) {
  test(`${name} keeps hosted public endpoints closed`, async () => {
    const { env, calls } = setup(overrides);
    assert.equal((await worker.fetch(request(), env)).status, 503);
    assert.equal((await worker.fetch(request(undefined, {}, '/api/reviews/config', 'GET'), env)).status, 503);
    assert.equal(calls.writes, 0);
  });
}

test('valid challenge and permitted request save a pending review', async t => {
  verification(t);
  const { env, calls } = setup();
  const response = await worker.fetch(request({ ...sample, status: 'approved' }), env);
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { status: 'pending' });
  assert.equal(calls.writes, 1);
  assert.deepEqual(calls.limits, [{ key: 'review:192.0.2.10' }]);
});

for (const [name, result] of [
  ['failed challenge', { success: false }],
  ['wrong website', { success: true, hostname: 'elsewhere.example', action: 'review-submit' }],
  ['wrong action', { success: true, hostname: 'reviews.example.com', action: 'other-form' }],
  ['missing claims', { success: true }],
  ['expired or reused token', { success: false, 'error-codes': ['timeout-or-duplicate'] }],
]) {
  test(`${name} never writes a review`, async t => {
    verification(t, result);
    const { env, calls } = setup();
    const response = await worker.fetch(request(), env);
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: 'challenge' });
    assert.equal(calls.writes, 0);
  });
}

test('missing or oversized challenge token fails before verification', async t => {
  const remote = verification(t);
  const { env, calls } = setup();
  for (const turnstileToken of [undefined, '', 'x'.repeat(2049), 42]) {
    assert.equal((await worker.fetch(request({ ...sample, turnstileToken }), env)).status, 400);
  }
  assert.equal(remote.mock.callCount(), 0);
  assert.equal(calls.writes, 0);
});

test('rate-limited requests stop before verification and database writes', async t => {
  const remote = verification(t);
  const { env, calls } = setup({ REVIEW_SUBMISSIONS: { limit: async () => ({ success: false }) } });
  const response = await worker.fetch(request(), env);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('Retry-After'), '60');
  assert.equal(remote.mock.callCount(), 0);
  assert.equal(calls.writes, 0);
});

test('missing Cloudflare IP refuses submission', async t => {
  const remote = verification(t);
  const { env, calls } = setup();
  const req = request(); req.headers.delete('CF-Connecting-IP');
  assert.equal((await worker.fetch(req, env)).status, 429);
  assert.equal(remote.mock.callCount(), 0);
  assert.equal(calls.writes, 0);
});

test('provider/network failures fail closed without logging secrets', async t => {
  const remote = t.mock.method(globalThis, 'fetch', async () => { throw new Error('private-test-key'); });
  const logs = t.mock.method(console, 'error', () => {});
  const { env, calls } = setup();
  assert.equal((await worker.fetch(request(), env)).status, 503);
  remote.mock.mockImplementation(async () => new Response(null, { status: 500 }));
  assert.equal((await worker.fetch(request(), env)).status, 503);
  assert.equal(calls.writes, 0);
  assert.ok(logs.mock.calls.every(call => JSON.stringify(call.arguments) === '["Review request failed"]'));
});

test('local config keeps development independent of Turnstile', async () => {
  const { env } = setup({ LOCAL_REVIEW_MODE: 'true' });
  const response = await worker.fetch(new Request('http://127.0.0.1:8787/api/reviews/config'), env);
  assert.deepEqual(await response.json(), { turnstileRequired: false, siteKey: null });
});
