import { ApiError, NetworkError } from '../../api/client'

/**
 * A network failure and a rejected request are different problems and get
 * different words (PLAN §9): "can't reach the server" is something the
 * operator can act on; the server's own message is not theirs to fix.
 */
export function describeError(error: unknown): { title: string; detail: string } {
  if (error instanceof NetworkError) {
    return { title: "Can't reach the server", detail: error.message }
  }
  if (error instanceof ApiError) {
    return { title: `Request failed (${error.code})`, detail: error.message }
  }
  return { title: 'Something went wrong', detail: 'An unexpected error occurred.' }
}
