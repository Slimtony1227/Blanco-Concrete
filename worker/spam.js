// Production submissions stay closed until every protection is configured.
export function reviewsReady(env) {
  return env.PUBLIC_REVIEWS_ENABLED === 'true' &&
    typeof env.TURNSTILE_SITE_KEY === 'string' && Boolean(env.TURNSTILE_SITE_KEY.trim()) &&
    typeof env.TURNSTILE_SECRET_KEY === 'string' && Boolean(env.TURNSTILE_SECRET_KEY.trim()) &&
    typeof env.REVIEW_SUBMISSIONS?.limit === 'function';
}

export async function limitSubmission(request, env) {
  // Cloudflare supplies this header. Never accept an IP from the submitted form.
  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip) return false;
  const { success } = await env.REVIEW_SUBMISSIONS.limit({ key: `review:${ip}` });
  return success === true;
}

export async function verifyChallenge(token, request, env) {
  if (typeof token !== 'string' || !token || token.length > 2048) return false;
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: env.TURNSTILE_SECRET_KEY, response: token,
      remoteip: request.headers.get('CF-Connecting-IP'),
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('Challenge verification unavailable');
  const result = await response.json();
  return result.success === true && result.hostname === env.ALLOWED_HOSTNAME && result.action === 'review-submit';
}
