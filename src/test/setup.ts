import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { server } from './server'

// `error` makes an unhandled request fail the test instead of hitting the
// network: every request a component makes has to be declared somewhere.
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  // Prevent auth token leakage between tests.
  localStorage.clear()
})

afterAll(() => {
  server.close()
})
