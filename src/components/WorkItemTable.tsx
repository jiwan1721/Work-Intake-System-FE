import type { WorkItem } from '../api/types'
import { PriorityBadge, StatusBadge } from './StatusBadge'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
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
    <table className="table">
      <caption className="visually-hidden">Work items, newest first</caption>
      <thead>
        <tr>
          <th scope="col">External ID</th>
          <th scope="col">Title</th>
          <th scope="col">Status</th>
          <th scope="col">Priority</th>
          <th scope="col">Created</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr
            key={item.id}
            className={item.id === selectedId ? 'table__row--selected' : undefined}
            aria-selected={item.id === selectedId}
          >
            <td>
              <button
                type="button"
                className="link-button"
                onClick={() => onSelect(item.id)}
                aria-label={`Open ${item.externalId}: ${item.title}`}
              >
                {item.externalId}
              </button>
            </td>
            <td>{item.title}</td>
            <td>
              <StatusBadge status={item.status} />
            </td>
            <td>
              {item.analysis ? (
                <PriorityBadge priority={item.analysis.priority} />
              ) : (
                <span className="muted">—</span>
              )}
            </td>
            <td>{formatDate(item.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
