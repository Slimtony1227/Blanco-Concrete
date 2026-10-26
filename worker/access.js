import { createRemoteJWKSet, jwtVerify } from 'jose';

// Reuse public verification keys between requests. jose refreshes this cache
// when it expires or Cloudflare introduces an unfamiliar signing key.
const keySets = new Map();

export function productionAccessSettings(env) {
  if (env.LOCAL_REVIEW_MODE !== 'false') return null;
  try {
    const team = new URL(env.TEAM_DOMAIN);
    if (team.protocol !== 'https:' || team.origin !== env.TEAM_DOMAIN ||
        !/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(team.hostname) ||
        typeof env.POLICY_AUD !== 'string' || !env.POLICY_AUD.trim() ||
        typeof env.ALLOWED_HOSTNAME !== 'string' ||
        !/^[a-z0-9]+(?:[a-z0-9.-]*[a-z0-9])?$/.test(env.ALLOWED_HOSTNAME)) return null;
    return { issuer: team.origin, audience: env.POLICY_AUD, hostname: env.ALLOWED_HOSTNAME };
  } catch { return null; }
}

export async function verifyAccess(request, settings) {
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return false;
  try {
    let keys = keySets.get(settings.issuer);
    if (!keys) {
      // Only the configured team chooses this URL, never a token or header.
      keys = createRemoteJWKSet(new URL(`${settings.issuer}/cdn-cgi/access/certs`), {
        timeoutDuration: 5000,
      });
      keySets.set(settings.issuer, keys);
    }
    await jwtVerify(token, keys, {
      issuer: settings.issuer,
      audience: settings.audience,
      algorithms: ['RS256'],
      requiredClaims: ['iss', 'aud', 'exp', 'sub'],
    });
    return true;
  } catch {
    // Missing keys, network failures, bad signatures, and invalid/expired claims
    // all deny access. Do not print login tokens or their contents into logs.
    return false;
  }
}
