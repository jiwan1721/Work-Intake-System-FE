/** FE-03 / FE-04: the detail view, its actions, and their pending states. */

import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'

import { WorkItemDetail } from './WorkItemDetail'
import { STALE_ITEM_MESSAGE } from '../hooks/useWorkItemActions'
import { server } from '../test/server'
import { ANALYSED, errorBody, makeDetail, renderApp } from '../test/utils'

const ID = 'aaaaaaaa-0000-4000-8000-aaaaaaaaaaaa'

/** Each refetch advances to the next response; the last one repeats. */
function detailReturns(...responses: Response[]) {
  let call = 0
  server.use(
    http.get(`/api/v1/work-items/${ID}`, () => {
      const response = responses[Math.min(call, responses.length - 1)]
      call += 1
      if (!response) throw new Error('detailReturns needs at least one response')
      return response.clone()
    }),
  )
}

const FAILED_ITEM = makeDetail({
  id: ID,
  externalId: 'CRM-FAIL',
  title: 'Timed out item',
  status: 'FAILED',
  lastError: { code: 'TIMEOUT', message: 'The model took too long to respond.' },
  allowedActions: ['retry'],
  attemptCount: 1,
})

const REVIEWABLE_ITEM = makeDetail({
  id: ID,
  externalId: 'CRM-OK',
  title: 'Analysed item',
  status: 'READY_FOR_REVIEW',
  analysis: { ...ANALYSED },
  allowedActions: ['complete'],
  attemptCount: 1,
  transitions: [
    {
      fromStatus: 'ANALYSING',
      toStatus: 'READY_FOR_REVIEW',
      actor: 'system',
      reason: 'analysis succeeded (mock)',
      createdAt: '2026-09-22T10:15:02Z',
    },
    {
      fromStatus: 'RECEIVED',
      toStatus: 'ANALYSING',
      actor: 'system',
      reason: 'analysis started (mock)',
      createdAt: '2026-09-22T10:15:00Z',
    },
  ],
})

const noop = () => {}

describe('failed items', () => {
  test('explains the error and offers Retry', async () => {
    detailReturns(HttpResponse.json(FAILED_ITEM))

    renderApp(<WorkItemDetail id={ID} onClose={noop} />)

    const failure = await screen.findByRole('alert')
    expect(within(failure).getByText('TIMEOUT')).toBeInTheDocument()
    expect(within(failure).getByText(/the model took too long/i)).toBeInTheDocument()
    // The human-readable translation of the code, not just the code.
    expect(
      within(failure).getByText(/took too long to respond\. retrying usually works/i),
    ).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /retry analysis/i })).toBeEnabled()
  })

  test('clicking Retry shows a pending state, then the new status', async () => {
    const user = userEvent.setup()
    let resolveRetry: (() => void) | undefined
    const retryStarted = new Promise<void>((resolve) => {
      resolveRetry = resolve
    })

    detailReturns(
      HttpResponse.json(FAILED_ITEM),
      HttpResponse.json({ ...REVIEWABLE_ITEM, externalId: 'CRM-FAIL' }),
    )
    server.use(
      http.post(`/api/v1/work-items/${ID}/retry`, async () => {
        resolveRetry?.()
        // Hold the request open so the pending state is observable.
        await new Promise((resolve) => setTimeout(resolve, 50))
        return HttpResponse.json({ ...REVIEWABLE_ITEM, externalId: 'CRM-FAIL' })
      }),
    )

    renderApp(<WorkItemDetail id={ID} onClose={noop} />)
    const retryButton = await screen.findByRole('button', { name: /retry analysis/i })

    await user.click(retryButton)
    await retryStarted

    const pending = screen.getByRole('button', { name: /retrying/i })
    expect(pending).toHaveAttribute('aria-busy', 'true')
    expect(pending).toBeDisabled()

    // Exact text: the history entry reads "Analysing → Ready for review".
    expect(await screen.findByText('Ready for review')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /retrying/i })).not.toBeInTheDocument()
  })

  test('an item out of attempts shows no Retry button and says why', async () => {
    detailReturns(
      HttpResponse.json(
        makeDetail({
          ...FAILED_ITEM,
          allowedActions: [],
          attemptCount: 5,
        }),
      ),
    )

    renderApp(<WorkItemDetail id={ID} onClose={noop} />)

    expect(await screen.findByText(/used all of its analysis attempts/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument()
  })
})

describe('allowedActions drives the buttons', () => {
  test('Complete is rendered when the server allows it', async () => {
    detailReturns(HttpResponse.json(REVIEWABLE_ITEM))

    renderApp(<WorkItemDetail id={ID} onClose={noop} />)

    expect(await screen.findByRole('button', { name: /mark complete/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^analyse$/i })).not.toBeInTheDocument()
  })

  test('Complete is not rendered when the server does not allow it', async () => {
    detailReturns(
      HttpResponse.json(
        makeDetail({ ...REVIEWABLE_ITEM, allowedActions: [], status: 'COMPLETED' }),
      ),
    )

    renderApp(<WorkItemDetail id={ID} onClose={noop} />)

    await screen.findByText(/no actions available/i)
    expect(screen.queryByRole('button', { name: /mark complete/i })).not.toBeInTheDocument()
  })

  test('a received item offers Analyse', async () => {
    detailReturns(
      HttpResponse.json(makeDetail({ id: ID, status: 'RECEIVED', allowedActions: ['analyse'] })),
    )

    renderApp(<WorkItemDetail id={ID} onClose={noop} />)

    expect(await screen.findByRole('button', { name: /^analyse$/i })).toBeInTheDocument()
  })
})

describe('conflicts', () => {
  test('a 409 shows the stale-item toast and refetches', async () => {
    const user = userEvent.setup()

    detailReturns(
      HttpResponse.json(REVIEWABLE_ITEM),
      HttpResponse.json(
        makeDetail({ ...REVIEWABLE_ITEM, status: 'COMPLETED', allowedActions: [] }),
      ),
    )
    server.use(
      http.patch(`/api/v1/work-items/${ID}/status`, () =>
        HttpResponse.json(
          errorBody('INVALID_TRANSITION', 'Cannot move work item from COMPLETED to COMPLETED.', {
            currentStatus: 'COMPLETED',
          }),
          { status: 409 },
        ),
      ),
    )

    renderApp(<WorkItemDetail id={ID} onClose={noop} />)
    await user.click(await screen.findByRole('button', { name: /mark complete/i }))

    expect(await screen.findByText(STALE_ITEM_MESSAGE)).toBeInTheDocument()
    // And the screen catches up with reality rather than staying stale.
    await waitFor(() => {
      expect(screen.getByText(/^completed$/i)).toBeInTheDocument()
    })
  })
})

describe('analysis and history', () => {
  test('shows the analysis fields', async () => {
    detailReturns(HttpResponse.json(REVIEWABLE_ITEM))

    renderApp(<WorkItemDetail id={ID} onClose={noop} />)

    expect(await screen.findByText('Document request')).toBeInTheDocument()
    expect(screen.getByText(ANALYSED.summary)).toBeInTheDocument()
    expect(screen.getByText(ANALYSED.recommendedAction)).toBeInTheDocument()
    expect(screen.getByText(/mock-v1/)).toBeInTheDocument()
  })

  test('shows the transition history newest first (FE-04)', async () => {
    detailReturns(HttpResponse.json(REVIEWABLE_ITEM))

    renderApp(<WorkItemDetail id={ID} onClose={noop} />)

    const history = await screen.findByRole('list')
    const entries = within(history).getAllByRole('listitem')
    expect(entries[0]).toHaveTextContent('Analysing → Ready for review')
    expect(entries[1]).toHaveTextContent('Received → Analysing')
    expect(entries[0]).toHaveTextContent('system')
  })
})

describe('loading and errors', () => {
  test('shows a loading state first', () => {
    detailReturns(HttpResponse.json(REVIEWABLE_ITEM))

    renderApp(<WorkItemDetail id={ID} onClose={noop} />)

    expect(screen.getByText(/loading work item/i)).toBeInTheDocument()
  })

  test('a 404 shows an error banner', async () => {
    detailReturns(
      HttpResponse.json(errorBody('NOT_FOUND', 'The requested resource does not exist.'), {
        status: 404,
      }),
    )

    renderApp(<WorkItemDetail id={ID} onClose={noop} />)

    const banner = await screen.findByRole('alert')
    expect(within(banner).getByText(/not_found/i)).toBeInTheDocument()
  })
})

describe('accessibility (FE-04)', () => {
  test('every control has an accessible name', async () => {
    detailReturns(HttpResponse.json(REVIEWABLE_ITEM))

    renderApp(<WorkItemDetail id={ID} onClose={noop} />)
    await screen.findByRole('button', { name: /mark complete/i })

    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAccessibleName()
    }
  })

  test('the panel and its sections are labelled', async () => {
    detailReturns(HttpResponse.json(REVIEWABLE_ITEM))

    renderApp(<WorkItemDetail id={ID} onClose={noop} />)
    await screen.findByRole('button', { name: /mark complete/i })

    expect(screen.getByRole('complementary', { name: /work item detail/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /ai analysis/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /description/i })).toBeInTheDocument()
  })

  test('actions are reachable by keyboard', async () => {
    const user = userEvent.setup()
    let patched = 0

    detailReturns(
      HttpResponse.json(REVIEWABLE_ITEM),
      HttpResponse.json(
        makeDetail({ ...REVIEWABLE_ITEM, status: 'COMPLETED', allowedActions: [] }),
      ),
    )
    server.use(
      http.patch(`/api/v1/work-items/${ID}/status`, () => {
        patched += 1
        return HttpResponse.json({ ...REVIEWABLE_ITEM, status: 'COMPLETED', allowedActions: [] })
      }),
    )

    renderApp(<WorkItemDetail id={ID} onClose={noop} />)
    const complete = await screen.findByRole('button', { name: /mark complete/i })

    complete.focus()
    expect(complete).toHaveFocus()
    await user.keyboard('{Enter}')

    // Enter on a focused button runs the action, same as a click.
    await waitFor(() => expect(patched).toBe(1))
    expect(await screen.findByText(/no actions available/i)).toBeInTheDocument()
  })
})
