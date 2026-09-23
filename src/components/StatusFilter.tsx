import { WORK_ITEM_STATUSES, type WorkItemStatus } from '../api/types'
import { statusLabel } from './statusLabels'

/**
 * Bound to `?status=` rather than component state (PLAN §9), so a filtered
 * view is bookmarkable, survives a refresh, and the back button works.
 */
export function StatusFilter({
  value,
  onChange,
}: {
  value: WorkItemStatus | undefined
  onChange: (status: WorkItemStatus | undefined) => void
}) {
  return (
    <div className="filter" role="group" aria-label="Filter by status">
      <FilterButton active={value === undefined} onClick={() => onChange(undefined)}>
        All
      </FilterButton>
      {WORK_ITEM_STATUSES.map((status) => (
        <FilterButton key={status} active={value === status} onClick={() => onChange(status)}>
          {statusLabel(status)}
        </FilterButton>
      ))}
    </div>
  )
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`filter__button${active ? ' filter__button--active' : ''}`}
    >
      {children}
    </button>
  )
}
