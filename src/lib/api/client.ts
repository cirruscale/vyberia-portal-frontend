const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function getToken(isCms = false): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(isCms ? 'cms_token' : 'portal_token')
}

export function setToken(token: string, isCms = false) {
  localStorage.setItem(isCms ? 'cms_token' : 'portal_token', token)
}

export function setRefreshToken(token: string, isCms = false) {
  localStorage.setItem(isCms ? 'cms_refresh_token' : 'portal_refresh_token', token)
}

export function clearTokens(isCms = false) {
  localStorage.removeItem(isCms ? 'cms_token' : 'portal_token')
  localStorage.removeItem(isCms ? 'cms_refresh_token' : 'portal_refresh_token')
}

export function getRefreshToken(isCms = false): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(isCms ? 'cms_refresh_token' : 'portal_refresh_token')
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  auth?: boolean
  cms?: boolean
  params?: Record<string, string | number | boolean | undefined>
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = false, cms = false, params, ...rest } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string>),
  }

  if (auth) {
    const token = getToken(cms)
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  let url = `${BASE_URL}${path}`
  if (params) {
    const filtered = Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    if (filtered.length) {
      url += '?' + new URLSearchParams(filtered.map(([k, v]) => [k, String(v)])).toString()
    }
  }

  const res = await fetch(url, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || data.message || `HTTP ${res.status}`)
  }

  return data as T
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}

export async function uploadFile(
  path: string,
  formData: FormData,
  cms = false
): Promise<Response> {
  const token = getToken(cms)
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  return fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  })
}
