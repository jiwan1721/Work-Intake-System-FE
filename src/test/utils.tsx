import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router'

import { AuthProvider } from '../contexts/AuthContext'
import { ToastProvider } from '../components/feedback/ToastProvider'
import type { Paginated, WorkItem, WorkItemDetail } from '../api/types'

/** A fresh client per test: no cache leaks between cases, no retries to wait for. */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  })
}

/**
 * Router "initial entry" — either a bare path or a location descriptor. Auth
 * pages depend on `location.state.email` being present, so tests need the
 * object form.
 */
export type RouteEntry = string | { pathname: string; state?: unknown; search?: string }

export function renderApp(
  ui: ReactElement,
  {
    route = '/',
    ...options
  }: { route?: RouteEntry } & Omit<RenderOptions, 'wrapper'> = {},
) {
  const queryClient = createTestQueryClient()

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) }
}

let sequence = 0

export function makeWorkItem(overrides: Partial<WorkItem> = {}): WorkItem {
  sequence += 1
  return {
    id: `0000000${sequence}-0000-4000-8000-00000000000${sequence}`,
    externalId: `CRM-${1000 + sequence}`,
    title: 'Missing income document',
    description: 'The applicant submitted their application but no payslip was attached.',
    status: 'RECEIVED',
    analysis: null,
    lastError: null,
    attemptCount: 0,
    allowedActions: ['analyse'],
    version: 1,
    createdAt: '2026-09-22T10:14:40Z',
    updatedAt: '2026-09-22T10:14:40Z',
    ...overrides,
  }
}

export function makeDetail(overrides: Partial<WorkItemDetail> = {}): WorkItemDetail {
  return {
    ...makeWorkItem(),
    attempts: [],
    transitions: [],
    ...overrides,
  }
}

export function makePage(items: WorkItem[], overrides: Partial<Paginated<WorkItem>> = {}) {
  return {
    count: items.length,
    page: 1,
    pageSize: 20,
    totalPages: 1,
    results: items,
    ...overrides,
  }
}

export const ANALYSED = {
  category: 'DOCUMENT_REQUEST',
  priority: 'HIGH',
  summary: 'The applicant needs to provide their latest payslip.',
  recommendedAction: 'Request the missing payslip from the applicant.',
  analysedAt: '2026-09-22T10:15:02Z',
  model: 'mock-v1',
} as const

export function errorBody(code: string, message: string, details: Record<string, unknown> = {}) {
  return { error: { code, message, details } }
}
