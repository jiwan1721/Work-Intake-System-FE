import { useWorkItem } from '../hooks/useWorkItem'
import { ActionButtons } from './ActionButtons'
import { AnalysisCard } from './AnalysisCard'
import { FailureCard } from './FailureCard'
import { StatusBadge } from './StatusBadge'
import { TransitionHistory } from './TransitionHistory'
import { ErrorBanner, LoadingBlock } from './feedback/Feedback'
import { CloseIcon } from './icons'

/**
 * The porcelain plate: the one light surface in the app, because this is where
 * an operator reads several hundred words of customer prose at a time.
 */
export function WorkItemDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: item, isPending, isError, error, refetch } = useWorkItem(id)

  return (
    <aside className="plate" aria-label="Work item detail">
      <div className="plate__header">
        <h2 className="plate__id">{item ? item.externalId : 'Work item'}</h2>
        <button type="button" className="plate__close" onClick={onClose}>
          <CloseIcon size={14} />
          Close
        </button>
      </div>

      {isPending ? <LoadingBlock label="Loading work item…" /> : null}

      {isError ? <ErrorBanner error={error} onRetry={() => void refetch()} /> : null}

      {item ? (
        <>
          <h3 className="plate__title">{item.title}</h3>
          <p className="plate__status">
            <StatusBadge status={item.status} />
          </p>

          <div className="plate__body">
            <section aria-labelledby="description-heading">
              <h4 className="section__head" id="description-heading">
                Description
              </h4>
              <p className="prose">{item.description}</p>
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
        </>
      ) : null}
    </aside>
  )
}
