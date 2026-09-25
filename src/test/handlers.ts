import { http, HttpResponse } from 'msw'

/**
 * Default handlers, applied to every test. Individual tests override them with
 * `server.use(...)` to exercise a specific response.
 *
 * Keep this list small: a test that depends on a specific payload should say so
 * in the test itself, not inherit it from here.
 */
export const handlers = [
  http.get('/api/v1/work-items', () =>
    HttpResponse.json({ count: 0, page: 1, pageSize: 20, results: [] }),
  ),
  // Satisfies the AuthProvider hydration call when tests pre-seed tokens.
  http.get('/api/v1/auth/me/', () =>
    HttpResponse.json({
      id: 1,
      email: 'operator@example.com',
      firstName: 'Test',
      lastName: 'Operator',
      fullName: 'Test Operator',
      isActive: true,
      dateJoined: '2026-01-01T00:00:00Z',
    }),
  ),
]
