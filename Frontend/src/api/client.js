const API_ORIGIN = import.meta.env.VITE_API_URL || '';
const BASE_URL = `${API_ORIGIN}/api/v1`;

/** Banner paths like /uploads/x.jpg live on the API server. */
export const assetUrl = (url) => (url && url.startsWith('/uploads/') ? API_ORIGIN + url : url);

const TOKEN_KEY = 'eventsphere_token';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage unavailable (private mode); session lasts for this tab only.
  }
};

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** Small fetch wrapper: JSON in/out, bearer auth, uniform errors. */
export async function api(path, { method = 'GET', body, query } = {}) {
  const url = new URL(BASE_URL + path, window.location.origin);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
  }
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(url, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError('Cannot reach the EventSphere server. Is the backend running?', 0);
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || `Request failed (${res.status})`, res.status, data.errors);
  return data;
}
