import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import worker from '../worker/index.js';

const base = 'http://127.0.0.1:8787';
const token = readFileSync('.dev.vars', 'utf8').match(/^LOCAL_ADMIN_TOKEN=(.+)$/m)?.[1].trim();
assert.ok(token, 'Run npm start first to create the development key');
const ids = [];
function request(path, method = 'GET', body, admin = false, origin = base) {
  return fetch(base + path, {
    method,
    headers: { Origin: origin, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(admin ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
async function pending() {
  return (await (await request('/api/admin/reviews?status=pending', 'GET', undefined, true)).json()).reviews;
}

test('local review lifecycle and access boundaries', async t => {
  // Only this test run's submissions are removed, even when an assertion fails.
  t.after(() => {
    if (!ids.length) return;
    const dir = mkdtempSync(join(tmpdir(), 'blanco-review-test-'));
    const file = join(dir, 'cleanup.sql');
    writeFileSync(file, `DELETE FROM reviews WHERE submission_id IN (${ids.map(id => `'${id}'`).join(',')});`);
    try {
      const cleanup = spawnSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'd1', 'execute', 'blanco-reviews-local', '--config', 'wrangler.local.jsonc', '--local', '--file', file], { encoding: 'utf8' });
      assert.equal(cleanup.status, 0, 'Temporary review cleanup failed');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  await t.test('existing pages and database connection', async () => {
    for (const path of ['/', '/nosotros', '/contacto', '/admin/reviews']) {
      const response = await request(path);
      assert.equal(response.status, 200);
      assert.match(await response.text(), /<div id="root">/);
    }
    assert.deepEqual(await (await request('/api/health')).json(), { ok: true, database: 'connected' });
    assert.equal((await request('/api/unknown')).status, 404);
  });

  await t.test('reject invalid and cross-origin submissions; protect management', async () => {
    assert.equal((await request('/api/admin/reviews')).status, 401);
    assert.equal((await request('/api/admin/reviews/1', 'PATCH', { status: 'approved' })).status, 401);
    assert.equal((await request('/api/reviews', 'POST', {}, false, 'https://other.example')).status, 403);
    for (const rating of [0, 6, 1.5, '5']) {
      assert.equal((await request('/api/reviews', 'POST', { name: 'Test', comment: 'Test review content', rating, submissionId: crypto.randomUUID() })).status, 400);
    }
    assert.equal((await request('/api/reviews', 'POST', null)).status, 400);
    assert.equal((await request('/api/reviews', 'POST', { comment: 'x'.repeat(17000) })).status, 413);
    assert.equal((await request('/api/reviews?before=invalid')).status, 400);
  });

  const submissionId = crypto.randomUUID();
  ids.push(submissionId);
  const sample = { submissionId, name: 'Local test reviewer', rating: 1, comment: '<script>test</script> is stored as plain customer text.', status: 'approved' };
  let reviewId;
  await t.test('submissions remain pending, including spoofed approvals and retries', async () => {
    assert.equal((await request('/api/reviews', 'POST', sample)).status, 201);
    assert.equal((await request('/api/reviews', 'POST', sample)).status, 201);
    const matches = (await pending()).filter(row => row.comment === sample.comment);
    assert.equal(matches.length, 1);
    reviewId = matches[0].id;
    assert.equal(matches[0].status, 'pending');
    const publicRows = (await (await request('/api/reviews')).json()).reviews;
    assert.ok(!publicRows.some(row => row.id === reviewId));
  });

  await t.test('approve, unpublish, reject, and retain history', async () => {
    for (const status of ['approved', 'pending', 'rejected']) {
      assert.equal((await request(`/api/admin/reviews/${reviewId}`, 'PATCH', { status }, true)).status, 200);
      const publicRows = (await (await request('/api/reviews')).json()).reviews;
      assert.equal(publicRows.some(row => row.id === reviewId), status === 'approved');
      const history = await (await request(`/api/admin/reviews?status=${status}`, 'GET', undefined, true)).json();
      assert.ok(history.reviews.some(row => row.id === reviewId && row.moderated_at));
    }
    assert.equal((await request(`/api/admin/reviews/${reviewId}`, 'PATCH', { status: 'invalid' }, true)).status, 400);
  });

  await t.test('older approved reviews paginate without exposing pending reviews', async () => {
    const approvedIds = [];
    for (let i = 0; i < 7; i++) {
      const id = crypto.randomUUID(); ids.push(id);
      await request('/api/reviews', 'POST', { ...sample, submissionId: id, name: `Pagination ${i}`, comment: `Temporary pagination review ${id}` });
      const row = (await pending()).find(review => review.comment.endsWith(id));
      assert.ok(row);
      approvedIds.push(row.id);
      await request(`/api/admin/reviews/${row.id}`, 'PATCH', { status: 'approved' }, true);
    }
    const page1 = await (await request('/api/reviews')).json();
    assert.equal(page1.reviews.length, 6);
    assert.ok(page1.next);
    const page2 = await (await request(`/api/reviews?before=${page1.next}`)).json();
    const seen = [...page1.reviews, ...page2.reviews].map(row => row.id);
    assert.equal(new Set(seen).size, seen.length);
    assert.ok(approvedIds.every(id => seen.includes(id)));
  });
});

test('local prototype refuses hosted requests or a missing local flag', async () => {
  const hosted = await worker.fetch(new Request('https://example.com/api/reviews'), { LOCAL_REVIEW_MODE: 'true' });
  assert.equal(hosted.status, 503);
  const unconfigured = await worker.fetch(new Request(base + '/api/reviews'), {});
  assert.equal(unconfigured.status, 503);
});
