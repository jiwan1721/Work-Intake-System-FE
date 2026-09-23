import type { StatusTransition } from '../api/types'
import { statusLabel } from './statusLabels'

/**
 * The audit trail (PLAN §4). Cheap to show, and the sort of thing a regulated
 * domain expects to be able to point at.
 */
export function TransitionHistory({ transitions }: { transitions: StatusTransition[] }) {
  if (transitions.length === 0) {
    return null
  }

  return (
    <section className="card" aria-labelledby="history-heading">
      <h3 id="history-heading">History</h3>
      <ol className="history">
        {transitions.map((transition) => (
          <li key={`${transition.createdAt}-${transition.toStatus}`} className="history__entry">
            <span className="history__change">
              {statusLabel(transition.fromStatus)} → {statusLabel(transition.toStatus)}
            </span>
            <span className="history__meta">
              {transition.actor} · {new Date(transition.createdAt).toLocaleString()}
            </span>
            {transition.reason ? (
              <span className="history__reason">{transition.reason}</span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  )
}
