import { useEffect, useRef, useState } from 'react'

import type { WorkItem } from '../api/types'
import { PriorityBadge, ServiceMarker, StatusBadge } from './StatusBadge'

/**
 * Compact and monospaced so the column cannot grow wider than the data.
 * The incumbent's "Sep 23, 2026, 2:40 PM" was what pushed the table off the
 * side of a phone; the logged time now rides under the title instead of
 * owning a column.
 */
function formatLogged(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function WorkItemTable({
  items,
  selectedId,
  onSelect,
}: {
  items: WorkItem[]
  selectedId: string | undefined
  onSelect: (id: string) => void
}) {
  return (
    <table className="services">
      <caption>Work items, newest first</caption>
      <thead>
        <tr>
          {/* Priority rides in this column rather than its own: the marker
              already encodes it, and a fourth column was what overflowed a
              390px viewport. */}
          <th scope="col">Item</th>
          <th scope="col">Title</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <ServiceRow
            key={item.id}
            item={item}
            selected={item.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </tbody>
    </table>
  )
}

function ServiceRow({
  item,
  selected,
  onSelect,
}: {
  item: WorkItem
  selected: boolean
  onSelect: (id: string) => void
}) {
  /**
   * Presentation-only memory of the last status this row rendered, so the
   * arrival plays when a verdict actually lands and not on every first paint,
   * which would spend the gesture. Both the ref and the flag are read in an
   * effect, never during render; TanStack Query stays the only owner of
   * server state (PLAN §9) and this holds no item data.
   */
  const previous = useRef(item.status)
  const [arriving, setArriving] = useState(false)

  useEffect(() => {
    if (previous.current === item.status) return
    previous.current = item.status
    setArriving(true)
    const done = setTimeout(() => setArriving(false), 900)
    return () => clearTimeout(done)
  }, [item.status])

  return (
    <tr
      className={`service service--${item.status.toLowerCase()}${selected ? ' service--selected' : ''}`}
    >
      <td className="service__cell-item">
        <span className="service__stub">
          <ServiceMarker
            status={item.status}
            priority={item.analysis?.priority}
            arriving={arriving}
          />
          <span className="service__ident">
            <span className="service__id">{item.externalId}</span>
            {item.analysis ? (
              <PriorityBadge priority={item.analysis.priority} />
            ) : (
              <span className="priority priority--none">Unrated</span>
            )}
          </span>
        </span>
      </td>
      <td>
        {/* The title is the control, not the 13px identifier beside it: a
            seven-hour queue needs a row-sized target (WCAG 2.5.8). */}
        <button
          type="button"
          className="service__open"
          onClick={() => onSelect(item.id)}
          aria-label={`Open ${item.externalId}: ${item.title}`}
          aria-current={selected ? 'true' : undefined}
        >
          <span className="service__subject">{item.title}</span>
          <span className="service__logged">{formatLogged(item.createdAt)}</span>
        </button>
      </td>
      <td className="service__cell-status">
        <StatusBadge status={item.status} />
      </td>
    </tr>
  )
}
