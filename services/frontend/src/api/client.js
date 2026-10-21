// API Base Client for Serendipity Table
const BASE_URL = '/api/v1';

export async function apiFetch(endpoint, options = {}) {
  const isAdmin = endpoint.startsWith('/admin');
  const token = isAdmin
    ? (localStorage.getItem('admin_token') || localStorage.getItem('token'))
    : localStorage.getItem('token');

  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, config);

  if (res.status === 401) {
    // 토큰 만료 또는 인증 실패
    if (isAdmin) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login?expired=true';
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = json?.message || `요청 실패 (${res.status})`;
    throw new Error(errorMsg);
  }

  return json?.data !== undefined ? json.data : json;
}

export default apiFetch;
