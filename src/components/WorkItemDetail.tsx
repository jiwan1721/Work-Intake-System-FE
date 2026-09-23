import { useWorkItem } from '../hooks/useWorkItem'
import { ActionButtons } from './ActionButtons'
import { AnalysisCard } from './AnalysisCard'
import { FailureCard } from './FailureCard'
import { StatusBadge } from './StatusBadge'
import { TransitionHistory } from './TransitionHistory'
import { ErrorBanner, LoadingBlock } from './feedback/Feedback'

export function WorkItemDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: item, isPending, isError, error, refetch } = useWorkItem(id)

  return (
    <aside className="panel" aria-label="Work item detail">
      <div className="panel__header">
        <h2>{item ? item.externalId : 'Work item'}</h2>
        <button type="button" className="button button--ghost" onClick={onClose}>
          Close
        </button>
      </div>

      {isPending ? <LoadingBlock label="Loading work item…" /> : null}

      {isError ? <ErrorBanner error={error} onRetry={() => void refetch()} /> : null}

      {item ? (
        <div className="panel__body">
          <div className="panel__title-row">
            <h3 className="panel__title">{item.title}</h3>
            <StatusBadge status={item.status} />
          </div>

          <section className="card" aria-labelledby="description-heading">
            <h3 id="description-heading">Description</h3>
            <p className="card__detail-text">{item.description}</p>
          </section>

          {item.analysis ? <AnalysisCard analysis={item.analysis} /> : null}

          {item.status === 'FAILED' && item.lastError ? (
            <FailureCard
              error={item.lastError}
              attemptCount={item.attemptCount}
              canRetry={item.allowedActions.includes('retry')}
            />
          ) : null}

          {item.status === 'ANALYSING' ? <LoadingBlock label="Analysis in progress…" /> : null}

          <ActionButtons itemId={item.id} allowedActions={item.allowedActions} />

          <TransitionHistory transitions={item.transitions} />
        </div>
      ) : null}
    </aside>
  )
}
