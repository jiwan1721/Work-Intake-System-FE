/** FE-01: the typed client's error contract. */

import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'

import { API_BASE, ApiError, NetworkError, api } from './client'
import { server } from '../test/server'
import { errorBody } from '../test/utils'

describe('API_BASE', () => {
  test('defaults to the proxied relative path, so the version appears once', () => {
    expect(API_BASE).toBe('/api/v1')
  })
})

describe('error handling', () => {
  test('an error envelope becomes an ApiError carrying the code', async () => {
    server.use(
      http.post('/api/v1/work-items/abc/retry', () =>
        HttpResponse.json(
          errorBody('NOT_RETRYABLE', 'Only failed work items can be retried.', {
            currentStatus: 'COMPLETED',
          }),
          { status: 409 },
        ),
      ),
    )

    const error = await api.post('/work-items/abc/retry').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    const apiError = error as ApiError
    expect(apiError.status).toBe(409)
    expect(apiError.code).toBe('NOT_RETRYABLE')
    expect(apiError.message).toBe('Only failed work items can be retried.')
    expect(apiError.details).toEqual({ currentStatus: 'COMPLETED' })
  })

  test('a 400 keeps the field details', async () => {
    server.use(
      http.post('/api/v1/work-items', () =>
        HttpResponse.json(
          errorBody('VALIDATION_ERROR', 'The request body failed validation.', {
            external_id: ['This field may not be blank.'],
          }),
          { status: 400 },
        ),
      ),
    )

    const error = (await api.post('/work-items', {}).catch((e: unknown) => e)) as ApiError

    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.details).toHaveProperty('external_id')
  })

  test('a failed fetch becomes a NetworkError, not an ApiError', async () => {
    server.use(http.get('/api/v1/work-items', () => HttpResponse.error()))

    const error = await api.get('/work-items').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(NetworkError)
    expect((error as NetworkError).message).toMatch(/check your connection/i)
  })

  test('a non-envelope error response still produces an ApiError', async () => {
    server.use(
      http.get(
        '/api/v1/work-items',
        () => new HttpResponse('<html>gateway</html>', { status: 502 }),
      ),
    )

    const error = (await api.get('/work-items').catch((e: unknown) => e)) as ApiError

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(502)
    expect(error.code).toBe('UNKNOWN')
  })
})

describe('success', () => {
  test('a JSON body is returned as-is', async () => {
    server.use(
      http.get('/api/v1/work-items/abc', () => HttpResponse.json({ id: 'abc', title: 'Hi' })),
    )

    await expect(api.get('/work-items/abc')).resolves.toEqual({ id: 'abc', title: 'Hi' })
  })
})
