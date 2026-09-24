import type { Priority, WorkItemStatus } from '../api/types'
import { statusLabel } from './statusLabels'

/**
 * Status is position on the network, so it reads as a line ink and a segment
 * of that line rather than a pill. The label text is unchanged, which is what
 * the tests and screen readers both rely on.
 */
export function StatusBadge({ status }: { status: WorkItemStatus }) {
  const key = status.toLowerCase()
  return (
    <span className={`status status--${key}`}>
      <span className={`status__bar status__bar--${key}`} aria-hidden="true" />
      {statusLabel(status)}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`priority priority--${priority.toLowerCase()}`}>{priority}</span>
}

/**
 * The interchange marker: a station sitting on the queue's trunk line. Ink
 * carries status; ring weight carries priority, because the line inks are
 * already spent on the five statuses and a second colour scale would make
 * neither readable.
 *
 * Every variant occupies the same 18px slot so each one centres on the trunk.
 * An unrated item is deliberately NOT the same mark as a LOW one — absence
 * gets a dashed ring of its own, or the queue misreports three items a page.
 */
const PRIORITY_SHAPE: Record<Priority, string> = {
  URGENT: 'marker--interchange',
  HIGH: 'marker--filled',
  MEDIUM: '',
  LOW: 'marker--tick',
}

export function ServiceMarker({
  status,
  priority,
  arriving,
}: {
  status: WorkItemStatus
  priority: Priority | undefined
  arriving: boolean
}) {
  const shape = priority ? PRIORITY_SHAPE[priority] : 'marker--unrated'
  return (
    <span
      // Remounting on a status change replays the arrival, which is how a
      // landed verdict becomes visible movement rather than a colour swap.
      key={status}
      className={
        `marker marker--${status.toLowerCase()} ${shape}${arriving ? ' marker--arriving' : ''}`.trim() // prettier-ignore
      }
      aria-hidden="true"
    />
  )
}
