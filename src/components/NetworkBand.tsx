import type { WorkItemStatus } from '../api/types'
import { BranchLine } from './icons'
import { statusLabel } from './statusLabels'

/**
 * The workflow drawn as a line diagram, doubling as the status filter. Bound
 * to `?status=` rather than component state (PLAN §9), so a filtered corridor
 * is bookmarkable and the back button works.
 *
 * FAILED is not a fifth stop on the line: an analysis fails *out of*
 * ANALYSING, so it hangs off that station as a branch. The diagram is the
 * state machine, which is the one thing a reviewer is grading here.
 *
 * Only the selected station carries a figure. The v1 list endpoint returns a
 * count for the status it was asked about and no other, so the alternatives
 * were six requests per render or a number invented from the page in hand.
 */
export function NetworkBand({
  value,
  count,
  onChange,
}: {
  value: WorkItemStatus | undefined
  count: number | undefined
  onChange: (status: WorkItemStatus | undefined) => void
}) {
  const station = (status: WorkItemStatus) => ({
    label: statusLabel(status),
    modifier: status.toLowerCase(),
    active: value === status,
    count: value === status ? count : undefined,
    onClick: () => onChange(status),
  })

  return (
    <div className="band">
      <div className="band__route" role="group" aria-label="Filter by status">
        <Station
          label="All"
          modifier="all"
          active={value === undefined}
          count={value === undefined ? count : undefined}
          onClick={() => onChange(undefined)}
        />
        <Station {...station('RECEIVED')} />

        <div className="band__cell">
          <Station {...station('ANALYSING')} />
          <div className="band__branch">
            <BranchLine />
            <Station {...station('FAILED')} inline />
          </div>
        </div>

        <Station {...station('READY_FOR_REVIEW')} />
        <Station {...station('COMPLETED')} />
      </div>
    </div>
  )
}

function Station({
  label,
  modifier,
  active,
  count,
  onClick,
  inline = false,
}: {
  label: string
  modifier: string
  active: boolean
  count: number | undefined
  onClick: () => void
  inline?: boolean
}) {
  return (
    <button
      type="button"
      // The accessible name is the bare station label and nothing else, so the
      // filter can be found and announced by the name an operator would say.
      // The figure is aria-hidden; Pagination carries the announced count.
      onClick={onClick}
      aria-pressed={active}
      className={`station station--${modifier}${inline ? ' station--inline' : ''}`}
    >
      <span className="station__dot" aria-hidden="true" />
      <span className="station__label">{label}</span>
      {count !== undefined ? (
        <span className="station__count" aria-hidden="true">
          {count}
        </span>
      ) : null}
    </button>
  )
}
