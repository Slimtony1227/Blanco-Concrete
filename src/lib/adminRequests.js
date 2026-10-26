// This selects the screen's login controls. The Worker independently checks access.
export function isLocalAdminHost(hostname) {
  return ['localhost', '127.0.0.1', '[::1]'].includes(hostname);
}

export class AdminSignInRequired extends Error {
  constructor() {
    super('Administrator sign-in required');
    this.name = 'AdminSignInRequired';
  }
}

export async function adminRequest(path, { local = false, token = '', ...options } = {}) {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  // Access returns 401 for expired browser requests instead of a login redirect.
  headers.set('X-Requested-With', 'XMLHttpRequest');
  headers.delete('Authorization');
  if (local) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(path, {
    ...options, headers, credentials: 'same-origin', redirect: 'manual',
  });
  if ([401, 403].includes(response.status) || response.type === 'opaqueredirect'
      || response.redirected || (response.status >= 300 && response.status < 400)) {
    throw new AdminSignInRequired();
  }
  if (!response.ok) throw new Error('Administrator request failed');
  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('text/html')) throw new AdminSignInRequired();
  if (!contentType.includes('application/json')) throw new Error('Unexpected administrator response');
  return response.json();
}
