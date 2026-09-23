import type { WorkItemAction } from '../api/types'
import { useWorkItemActions } from '../hooks/useWorkItemActions'
import { Spinner } from './feedback/Feedback'

const LABELS: Record<WorkItemAction, string> = {
  analyse: 'Analyse',
  retry: 'Retry analysis',
  complete: 'Mark complete',
}

const PENDING_LABELS: Record<WorkItemAction, string> = {
  analyse: 'Analysing…',
  retry: 'Retrying…',
  complete: 'Completing…',
}

/**
 * Rendered entirely from `allowedActions` (PLAN §8), which the server computes
 * from the state machine. The UI never decides for itself whether an action
 * is legal, so the buttons and the backend cannot disagree.
 */
export function ActionButtons({
  itemId,
  allowedActions,
}: {
  itemId: string
  allowedActions: WorkItemAction[]
}) {
  const actions = useWorkItemActions(itemId)

  if (allowedActions.length === 0) {
    return <p className="muted">No actions available for this item.</p>
  }

  return (
    <div className="actions">
      {allowedActions.map((action) => {
        const mutation = actions.byAction[action]
        const isThisPending = mutation.isPending

        return (
          <button
            key={action}
            type="button"
            className="button button--primary"
            onClick={() => mutation.mutate()}
            // While any action runs, every action for this item is disabled:
            // a second click must not queue a second workflow transition.
            disabled={actions.isPending}
            aria-busy={isThisPending}
          >
            {isThisPending ? (
              <>
                <Spinner label="" />
                {PENDING_LABELS[action]}
              </>
            ) : (
              LABELS[action]
            )}
          </button>
        )
      })}
    </div>
  )
}
