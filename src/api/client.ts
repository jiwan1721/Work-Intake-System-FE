import type { ApiErrorBody } from './types'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  notifySessionExpired,
  setTokens,
} from './tokens'

/**
 * The single place the API version appears (PLAN §9). Everything else asks
 * for `/work-items`, not `/api/v1/work-items`, so moving to v2 is one edit.
 *
 * The default is relative, which means the browser talks to its own origin
 * and Vite proxies /api to the backend — no CORS configuration to get wrong.
 */
// An empty string (e.g. from a cleared env var in the test profile) falls
// through to the relative default, which the Vite proxy and MSW both match.
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'

/**
 * The server answered, and said no. Carries the envelope's code so the UI can
 * react to *which* failure it was (409 -> refresh, 400 -> show field errors)
 * rather than pattern-matching on message text.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: Record<string, unknown>

  constructor(status: number, code: string, message: string, details: Record<string, unknown>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

/** We never reached the server. A different problem, and a different message. */
export class NetworkError extends Error {
  constructor(message = 'Check your connection and try again.') {
    super(message)
    this.name = 'NetworkError'
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null || !('error' in value)) return false
  const { error } = value
  return (
    typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
  )
}

// These paths never require a token and must not trigger a 401 retry loop.
const NO_AUTH_PATHS = new Set([
  '/auth/login/',
  '/auth/register/',
  '/auth/refresh/',
  '/auth/forgot-password/',
  '/auth/reset-password/',
])

// Shared refresh promise: concurrent 401s all wait on the same call instead of
// each firing their own refresh request.
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise

  const doRefresh = async (): Promise<string> => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) throw new Error('No refresh token available.')

    const response = await fetch(`${API_BASE}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    if (!response.ok) throw new Error('Token refresh failed.')

    const data = (await response.json()) as { access: string }
    setTokens(data.access, refreshToken)
    return data.access
  }

  refreshPromise = doRefresh()
  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

async function doFetch(path: string, init?: RequestInit, token?: string | null): Promise<Response> {
  try {
    return await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    })
  } catch {
    throw new NetworkError()
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isPublic = NO_AUTH_PATHS.has(path)
  const token = isPublic ? null : getAccessToken()

  let response = await doFetch(path, init, token)

  // On 401 for a protected path, attempt a single token refresh and retry.
  if (response.status === 401 && !isPublic) {
    try {
      const newToken = await refreshAccessToken()
      response = await doFetch(path, init, newToken)
    } catch {
      clearTokens()
      notifySessionExpired()
      throw new ApiError(
        401,
        'SESSION_EXPIRED',
        'Your session has expired. Please sign in again.',
        {},
      )
    }
  }

  if (response.status === 204) {
    return undefined as T
  }

  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    if (isApiErrorBody(body)) {
      throw new ApiError(response.status, body.error.code, body.error.message, body.error.details)
    }
    // A proxy or crash produced something that is not our envelope.
    throw new ApiError(
      response.status,
      'UNKNOWN',
      `The server returned an unexpected ${response.status} response.`,
      {},
    )
  }

  return body as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
}
