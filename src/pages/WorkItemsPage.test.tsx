/** FE-02: the list, its filter, and every state it can be in. */

import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { WorkItemsPage } from './WorkItemsPage'
import { server } from '../test/server'
import { errorBody, makePage, makeWorkItem, renderApp } from '../test/utils'

const FAILED = makeWorkItem({
  externalId: 'CRM-FAIL',
  title: 'Timed out item',
  status: 'FAILED',
  lastError: { code: 'TIMEOUT', message: 'The model took too long.' },
  allowedActions: ['retry'],
  attemptCount: 1,
})

const RECEIVED = makeWorkItem({ externalId: 'CRM-NEW', title: 'Brand new item' })

function listReturns(handler: (url: URL) => Response) {
  server.use(http.get('/api/v1/work-items', ({ request }) => handler(new URL(request.url))))
}

beforeEach(() => {
  listReturns(() => HttpResponse.json(makePage([FAILED, RECEIVED])))
})

describe('loading and rendering', () => {
  test('shows a loading state, then the items', async () => {
    renderApp(<WorkItemsPage />)

    expect(screen.getByText(/loading work items/i)).toBeInTheDocument()

    expect(await screen.findByText('Timed out item')).toBeInTheDocument()
    expect(screen.getByText('Brand new item')).toBeInTheDocument()
  })
})

describe('status filter', () => {
  test('choosing Failed puts the status in the URL and shows only failed items', async () => {
    const user = userEvent.setup()
    const requested: string[] = []

    listReturns((url) => {
      const status = url.searchParams.get('status')
      requested.push(status ?? 'ALL')
      const items = status === 'FAILED' ? [FAILED] : [FAILED, RECEIVED]
      return HttpResponse.json(makePage(items))
    })

    renderApp(<WorkItemsPage />)
    await screen.findByText('Brand new item')

    await user.click(screen.getByRole('button', { name: 'Failed' }))

    await waitFor(() => {
      expect(screen.queryByText('Brand new item')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Timed out item')).toBeInTheDocument()

    // The filter is a real query parameter, so the view is shareable.
    expect(requested).toContain('FAILED')
    expect(screen.getByRole('button', { name: 'Failed' })).toHaveAttribute('aria-pressed', 'true')
  })

  test('a status in the initial URL is applied on first load', async () => {
    const requested: (string | null)[] = []
    listReturns((url) => {
      requested.push(url.searchParams.get('status'))
      return HttpResponse.json(makePage([FAILED]))
    })

    renderApp(<WorkItemsPage />, { route: '/?status=FAILED' })

    await screen.findByText('Timed out item')
    expect(requested).toEqual(['FAILED'])
  })

  test('an unrecognised status in the URL is ignored rather than sent on', async () => {
    const requested: (string | null)[] = []
    listReturns((url) => {
      requested.push(url.searchParams.get('status'))
      return HttpResponse.json(makePage([FAILED, RECEIVED]))
    })

    renderApp(<WorkItemsPage />, { route: '/?status=NONSENSE' })

    await screen.findByText('Brand new item')
    expect(requested).toEqual([null])
  })
})

describe('empty state', () => {
  test('names the filter it is empty for', async () => {
    listReturns(() => HttpResponse.json(makePage([])))

    renderApp(<WorkItemsPage />, { route: '/?status=FAILED' })

    expect(await screen.findByText(/no failed items/i)).toBeInTheDocument()
  })

  test('has different wording when nothing exists at all', async () => {
    listReturns(() => HttpResponse.json(makePage([])))

    renderApp(<WorkItemsPage />)

    expect(await screen.findByText(/no work items yet/i)).toBeInTheDocument()
  })
})

describe('error state', () => {
  test('shows a banner and Try again refetches', async () => {
    const user = userEvent.setup()
    let attempt = 0

    listReturns(() => {
      attempt += 1
      return attempt === 1
        ? HttpResponse.json(errorBody('INTERNAL_ERROR', 'Something went wrong on our side.'), {
            status: 500,
          })
        : HttpResponse.json(makePage([RECEIVED]))
    })

    renderApp(<WorkItemsPage />)

    const banner = await screen.findByRole('alert')
    expect(within(banner).getByText(/internal_error/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /try again/i }))

    expect(await screen.findByText('Brand new item')).toBeInTheDocument()
  })

  test('a network failure is worded differently from a server error', async () => {
    listReturns(() => HttpResponse.error())

    renderApp(<WorkItemsPage />)

    const banner = await screen.findByRole('alert')
    expect(within(banner).getByText(/can't reach the server/i)).toBeInTheDocument()
  })
})

describe('polling', () => {
  test('polls while an item is analysing and stops once it settles', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      let calls = 0
      listReturns(() => {
        calls += 1
        const status = calls < 2 ? 'ANALYSING' : 'READY_FOR_REVIEW'
        return HttpResponse.json(
          makePage([makeWorkItem({ externalId: 'CRM-BUSY', title: 'Busy item', status })]),
        )
      })

      renderApp(<WorkItemsPage />)
      await screen.findByText('Busy item')
      expect(calls).toBe(1)

      await vi.advanceTimersByTimeAsync(2100)
      await waitFor(() => expect(calls).toBe(2))

      // Now READY_FOR_REVIEW: no further polling.
      await vi.advanceTimersByTimeAsync(5000)
      expect(calls).toBe(2)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('pagination', () => {
  test('shows the page position and requests the next page', async () => {
    const user = userEvent.setup()
    const pages: (string | null)[] = []

    listReturns((url) => {
      pages.push(url.searchParams.get('page'))
      return HttpResponse.json(
        makePage([RECEIVED], { count: 25, page: pages.length, totalPages: 2 }),
      )
    })

    renderApp(<WorkItemsPage />)
    await screen.findByText('Brand new item')
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => expect(pages).toEqual([null, '2']))
  })
})
