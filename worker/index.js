// Review API with local development keys and production Cloudflare Access checks.
import { productionAccessSettings, verifyAccess } from './access.js';
import { reviewsReady, limitSubmission, verifyChallenge } from './spam.js';

const STATUSES = ['pending', 'approved', 'rejected'];
const PAGE_SIZE = 6;
const json = (data, status = 200, headers = {}) => Response.json(data, {
  status, headers: { 'Cache-Control': 'no-store', ...headers },
});

async function readBody(request) {
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) {
    throw Object.assign(new Error('invalid'), { status: 415 });
  }
  if (!request.body) throw Object.assign(new Error('invalid'), { status: 400 });
  const reader = request.body.getReader();
  const chunks = [];
  let length = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 16384) {
      await reader.cancel();
      throw Object.assign(new Error('invalid'), { status: 413 });
    }
    chunks.push(value);
  }
  const buffer = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(buffer)); }
  catch { throw Object.assign(new Error('invalid'), { status: 400 }); }
}

async function listReviews(url, env, status) {
  const before = url.searchParams.get('before');
  if (before && (!/^\d+$/.test(before) || !Number.isSafeInteger(Number(before)))) return json({ error: 'invalid' }, 400);
  const { results } = await env.DB.prepare(
    `SELECT id, display_name, rating, comment, created_at, status, moderated_at
     FROM reviews WHERE status = ? AND id < ? ORDER BY id DESC LIMIT ?`,
  ).bind(status, before ? Number(before) : Number.MAX_SAFE_INTEGER, PAGE_SIZE + 1).all();
  const reviews = results.slice(0, PAGE_SIZE);
  return json({ reviews, next: results.length > PAGE_SIZE ? reviews.at(-1).id : null });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Classify paths before serving assets, including encoded or repeated slashes.
    // Reject ambiguous double encoding rather than letting another layer decode it.
    let path;
    try {
      const decoded = decodeURIComponent(url.pathname);
      if (/%[0-9a-f]{2}/i.test(decoded)) return json({ error: 'invalid' }, 400);
      path = new URL(url.origin + decoded.replaceAll('\\', '/').replace(/\/+/g, '/')).pathname;
    } catch { return json({ error: 'invalid' }, 400); }
    // React Router matches page routes without regard to letter case by default.
    const routePath = path.toLowerCase();
    const isApi = routePath === '/api' || routePath.startsWith('/api/');
    const isAdminApi = routePath === '/api/admin' || routePath.startsWith('/api/admin/');
    const isAdminPage = routePath === '/admin' || routePath.startsWith('/admin/');
    const local = env.LOCAL_REVIEW_MODE === 'true' && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
    const production = productionAccessSettings(env);

    if (production && (url.hostname !== production.hostname || url.protocol !== 'https:' || url.port)) {
      return json({ error: 'forbidden' }, 403);
    }
    if (!local && !production && (isApi || isAdminPage || env.LOCAL_REVIEW_MODE === 'false')) {
      return json({ error: 'unavailable' }, 503);
    }
    if ((isApi || isAdminPage) && !['GET', 'HEAD'].includes(request.method) && request.headers.get('Origin') !== url.origin) {
      return json({ error: 'forbidden' }, 403);
    }
    if (production && (isAdminApi || isAdminPage)) {
      if (!await verifyAccess(request, production)) return json({ error: 'unauthorized' }, 401);
    } else if (local && isAdminApi) {
      // Local pages still show the development key form; only their API needs it.
      if (!env.LOCAL_ADMIN_TOKEN || request.headers.get('Authorization') !== `Bearer ${env.LOCAL_ADMIN_TOKEN}`) {
        return json({ error: 'unauthorized' }, 401);
      }
    }
    if (!isApi) {
      const response = await env.ASSETS.fetch(request);
      if (!isAdminPage) return response;
      const privatePage = new Response(response.body, response);
      privatePage.headers.set('Cache-Control', 'no-store');
      privatePage.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return privatePage;
    }
    // Opening production reviews requires an explicit switch and all protections.
    if (production && !isAdminApi && !reviewsReady(env)) return json({ error: 'unavailable' }, 503);
    url.pathname = path;

    try {
      if (url.pathname === '/api/reviews/config' && request.method === 'GET') {
        return json({ turnstileRequired: !local, siteKey: local ? null : env.TURNSTILE_SITE_KEY });
      }
      if (url.pathname === '/api/health' && request.method === 'GET') {
        if (!local) return json({ error: 'not_found' }, 404);
        await env.DB.prepare('SELECT 1 AS connected').first();
        return json({ ok: true, database: 'connected' });
      }
      if (url.pathname === '/api/reviews' && request.method === 'GET') return await listReviews(url, env, 'approved');
      if (url.pathname === '/api/reviews' && request.method === 'POST') {
        if (production && !await limitSubmission(request, env)) {
          return json({ error: 'rate_limited' }, 429, { 'Retry-After': '60' });
        }
        const body = await readBody(request);
        const name = typeof body?.name === 'string' ? body.name.trim() : '';
        const comment = typeof body?.comment === 'string' ? body.comment.trim() : '';
        if (name.length < 2 || name.length > 60 || comment.length < 10 || comment.length > 2000 ||
            !Number.isInteger(body?.rating) || body.rating < 1 || body.rating > 5 ||
            typeof body.submissionId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.submissionId)) {
          return json({ error: 'invalid' }, 400);
        }
        if (production && !await verifyChallenge(body.turnstileToken, request, env)) {
          return json({ error: 'challenge' }, 400);
        }
        // Repeating the same submission after a connection error won't add it twice.
        // The server always chooses pending, ignoring any status sent by a visitor.
        await env.DB.prepare(`INSERT INTO reviews (submission_id, display_name, rating, comment)
          VALUES (?, ?, ?, ?) ON CONFLICT(submission_id) DO NOTHING`)
          .bind(body.submissionId, name, body.rating, comment).run();
        return json({ status: 'pending' }, 201);
      }
      if (url.pathname === '/api/admin/reviews' && request.method === 'GET') {
        const status = url.searchParams.get('status') || 'pending';
        if (!STATUSES.includes(status)) return json({ error: 'invalid' }, 400);
        return await listReviews(url, env, status);
      }
      const match = url.pathname.match(/^\/api\/admin\/reviews\/(\d+)$/);
      if (match && request.method === 'PATCH') {
        const body = await readBody(request);
        if (!STATUSES.includes(body?.status)) return json({ error: 'invalid' }, 400);
        const result = await env.DB.prepare(`UPDATE reviews SET status = ?,
          moderated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`)
          .bind(body.status, Number(match[1])).run();
        return result.meta.changes ? json({ ok: true }) : json({ error: 'not_found' }, 404);
      }
      if (['/api/health', '/api/reviews', '/api/reviews/config', '/api/admin/reviews'].includes(url.pathname) || match) {
        return json({ error: 'method' }, 405);
      }
      return json({ error: 'not_found' }, 404);
    } catch (error) {
      if (error.status) return json({ error: 'invalid' }, error.status);
      // Do not log submitted text, credentials, or verification tokens.
      console.error('Review request failed');
      return json({ error: 'unavailable' }, 503);
    }
  },
};
