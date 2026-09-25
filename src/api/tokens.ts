// Tokens are stored in localStorage because the backend returns them in the
// JSON body (not via Set-Cookie). For httpOnly cookie support, the backend
// would need to set the cookie itself — possible future improvement.
const ACCESS_KEY = 'wis_access'
const REFRESH_KEY = 'wis_refresh'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

// AuthContext registers this on mount so client.ts can trigger logout without
// importing React. The indirection keeps the API layer free of React deps.
let _sessionExpiredHandler: (() => void) | null = null

export function registerSessionExpiredHandler(handler: () => void): void {
  _sessionExpiredHandler = handler
}

export function notifySessionExpired(): void {
  _sessionExpiredHandler?.()
}
