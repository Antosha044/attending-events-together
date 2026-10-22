const API_BASE = import.meta.env.VITE_API_URL ?? '/api/v1'
const ACCESS_KEY = 'events-together-access-token'
const REFRESH_KEY = 'events-together-refresh-token'

type ApiOptions = RequestInit & { skipRefresh?: boolean }
let refreshInFlight: Promise<boolean> | undefined

export class ApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); this.name = 'ApiError' }
}

export function getTokens() {
  return { access: localStorage.getItem(ACCESS_KEY), refresh: localStorage.getItem(REFRESH_KEY) }
}

export function hasSession() { return Boolean(getTokens().refresh) }

export function storeTokens(tokens: { access_token: string; refresh_token: string }) {
  localStorage.setItem(ACCESS_KEY, tokens.access_token)
  localStorage.setItem(REFRESH_KEY, tokens.refresh_token)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

async function refreshSession(): Promise<boolean> {
  const refresh = getTokens().refresh
  if (!refresh) return false
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: refresh }),
    })
    if (!response.ok) { clearTokens(); window.dispatchEvent(new Event('auth-expired')); return false }
    storeTokens(await response.json())
    return true
  } catch { return false }
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipRefresh = false, ...requestOptions } = options
  const perform = () => {
    const headers = new Headers(requestOptions.headers)
    if (requestOptions.body && !(requestOptions.body instanceof FormData)) headers.set('Content-Type', 'application/json')
    const access = getTokens().access
    if (access) headers.set('Authorization', `Bearer ${access}`)
    return fetch(`${API_BASE}${path}`, { ...requestOptions, headers })
  }
  let response: Response
  try { response = await perform() } catch { throw new ApiError('Не удалось связаться с сервером. Проверьте подключение и попробуйте снова.', 0) }
  if (response.status === 401 && !skipRefresh && getTokens().refresh) {
    refreshInFlight ??= refreshSession().finally(() => { refreshInFlight = undefined })
    if (await refreshInFlight) return apiRequest<T>(path, { ...options, skipRefresh: true })
  }
  if (!response.ok) {
    let detail = `Ошибка сервера (${response.status})`
    try {
      const body = await response.json()
      detail = Array.isArray(body.detail) ? body.detail.map((item: { msg?: string }) => item.msg).join(' ') : body.detail || detail
    } catch { /* Keep the status-based message for non-JSON responses. */ }
    throw new ApiError(detail, response.status)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
