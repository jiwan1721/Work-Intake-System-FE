import type { ApiErrorBody } from './types'

/**
 * The single place the API version appears (PLAN §9). Everything else asks
 * for `/work-items`, not `/api/v1/work-items`, so moving to v2 is one edit.
 *
 * The default is relative, which means the browser talks to its own origin
 * and Vite proxies /api to the backend — no CORS configuration to get wrong.
 */
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

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

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
  } catch {
    throw new NetworkError()
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
