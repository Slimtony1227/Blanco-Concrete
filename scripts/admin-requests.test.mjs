import test from 'node:test';
import assert from 'node:assert/strict';
import { adminRequest, AdminSignInRequired, isLocalAdminHost } from '../src/lib/adminRequests.js';

test('only loopback names show local key controls', () => {
  for (const host of ['localhost', '127.0.0.1', '[::1]']) assert.equal(isLocalAdminHost(host), true);
  for (const host of ['blancosconcretepaintandmaintenance.com', 'localhost.example.com', '127.0.0.2']) {
    assert.equal(isLocalAdminHost(host), false);
  }
});

test('hosted requests use cookies and never send a local bearer key', async t => {
  t.mock.method(globalThis, 'fetch', async (path, options) => {
    assert.equal(path, '/api/admin/reviews/3');
    assert.equal(options.credentials, 'same-origin');
    assert.equal(options.redirect, 'manual');
    assert.equal(options.headers.get('Authorization'), null);
    assert.equal(options.headers.get('X-Requested-With'), 'XMLHttpRequest');
    assert.equal(options.headers.get('Content-Type'), 'application/json');
    assert.equal(options.method, 'PATCH');
    assert.equal(options.body, '{"status":"approved"}');
    return Response.json({ ok: true });
  });
  assert.deepEqual(await adminRequest('/api/admin/reviews/3', {
    token: 'must-not-be-sent', method: 'PATCH', body: '{"status":"approved"}',
    headers: { Authorization: 'Bearer must-not-be-sent', 'Content-Type': 'application/json' },
  }), { ok: true });
});

test('local requests preserve the in-memory key and cancellation signal', async t => {
  const controller = new AbortController();
  t.mock.method(globalThis, 'fetch', async (_path, options) => {
    assert.equal(options.headers.get('Authorization'), 'Bearer local-test');
    assert.equal(options.signal, controller.signal);
    return Response.json({ reviews: [], next: null });
  });
  assert.deepEqual(await adminRequest('/api/admin/reviews', {
    local: true, token: 'local-test', signal: controller.signal,
  }), { reviews: [], next: null });
});

for (const [name, response] of [
  ['expired session', new Response(null, { status: 401 })],
  ['denied access', new Response(null, { status: 403 })],
  ['login redirect', new Response(null, { status: 302 })],
  ['opaque login redirect', { type: 'opaqueredirect', status: 0 }],
  ['followed login redirect', { redirected: true, status: 200 }],
  ['login HTML', new Response('<html>Sign in</html>', { headers: { 'Content-Type': 'text/html' } })],
]) {
  test(`${name} requests a new sign-in`, async t => {
    t.mock.method(globalThis, 'fetch', async () => response);
    await assert.rejects(adminRequest('/api/admin/reviews'), AdminSignInRequired);
  });
}

test('server and network failures are not mislabeled as expired sessions', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 503 }));
  await assert.rejects(adminRequest('/api/admin/reviews'), error => !(error instanceof AdminSignInRequired));
  fetchMock.mock.mockImplementation(async () => { throw new TypeError('Network failure'); });
  await assert.rejects(adminRequest('/api/admin/reviews'), TypeError);
});

test('unexpected response data cannot be treated as a successful action', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('OK'));
  await assert.rejects(adminRequest('/api/admin/reviews'), /Unexpected administrator response/);
});
