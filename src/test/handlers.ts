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
]
