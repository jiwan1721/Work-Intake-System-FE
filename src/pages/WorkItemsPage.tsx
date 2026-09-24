import { useSearchParams } from 'react-router'

import { isWorkItemStatus, type WorkItemStatus } from '../api/types'
import { NetworkBand } from '../components/NetworkBand'
import { Pagination } from '../components/Pagination'
import { WorkItemDetail } from '../components/WorkItemDetail'
import { WorkItemTable } from '../components/WorkItemTable'
import { EmptyState, ErrorBanner, LoadingBlock, Spinner } from '../components/feedback/Feedback'
import { statusLabel } from '../components/statusLabels'
import { useWorkItems } from '../hooks/useWorkItems'

/**
 * Filter, page and selection all live in the URL (PLAN §9). There is no
 * `useState` copy of server data anywhere in this tree: TanStack Query owns
 * it, so there is exactly one source of truth to keep fresh.
 */
export function WorkItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const statusParam = searchParams.get('status')
  const status: WorkItemStatus | undefined =
    statusParam && isWorkItemStatus(statusParam) ? statusParam : undefined

  const page = Math.max(Number(searchParams.get('page') ?? '1') || 1, 1)
  const selectedId = searchParams.get('item') ?? undefined

  const query = useWorkItems({ status, page })

  const update = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined) next.delete(key)
      else next.set(key, value)
    }
    setSearchParams(next)
  }

  return (
    <div className="app">
      <header className="masthead">
        <div className="masthead__mark">
          <h1 className="masthead__name">TriageDesk</h1>
          <p className="masthead__strap">AI-assisted work intake</p>
        </div>
        {/* A background refetch should be visible but must not replace the
            table the operator is reading. */}
        {query.isFetching && !query.isPending ? (
          <span className="refreshing">
            <Spinner label="" /> Refreshing
          </span>
        ) : null}
      </header>

      <NetworkBand
        value={status}
        count={query.data?.count}
        onChange={(next) => update({ status: next, page: undefined, item: undefined })}
      />

      <div className={selectedId ? 'main main--split' : 'main'}>
        <div className="queue">
          {query.isPending ? <LoadingBlock label="Loading work items…" /> : null}

          {query.isError ? (
            <ErrorBanner error={query.error} onRetry={() => void query.refetch()} />
          ) : null}

          {query.data ? (
            query.data.results.length === 0 ? (
              <EmptyState
                title={
                  status ? `No ${statusLabel(status).toLowerCase()} items` : 'No work items yet'
                }
                hint={
                  status
                    ? 'Nothing is on this part of the line right now. Choose another station.'
                    : 'New work items appear here as they arrive from the intake system.'
                }
              />
            ) : (
              <>
                <WorkItemTable
                  items={query.data.results}
                  selectedId={selectedId}
                  onSelect={(id) => update({ item: id })}
                />
                <Pagination
                  page={query.data.page}
                  totalPages={query.data.totalPages}
                  count={query.data.count}
                  onChange={(next) => update({ page: String(next) })}
                />
              </>
            )
          ) : null}
        </div>

        {selectedId ? (
          <WorkItemDetail id={selectedId} onClose={() => update({ item: undefined })} />
        ) : null}
      </div>
    </div>
  )
}
