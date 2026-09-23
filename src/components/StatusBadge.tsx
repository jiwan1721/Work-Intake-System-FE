import type { Priority, WorkItemStatus } from '../api/types'
import { statusLabel } from './statusLabels'

export function StatusBadge({ status }: { status: WorkItemStatus }) {
  return (
    <span className={`badge badge--${status.toLowerCase()}`}>
      {status === 'ANALYSING' ? (
        <span className="spinner spinner--inline" aria-hidden="true" />
      ) : null}
      {statusLabel(status)}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`badge badge--priority-${priority.toLowerCase()}`}>{priority}</span>
}
