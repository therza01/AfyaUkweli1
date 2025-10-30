export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('afya_token');
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('afya_user');
  return userStr ? JSON.parse(userStr) : null;
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('afya_token');
  localStorage.removeItem('afya_user');
  window.location.href = '/login';
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();

  if (!token) {
    throw new Error('No authentication token');
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);

  return fetch(url, {
    ...options,
    headers,
  });
}
