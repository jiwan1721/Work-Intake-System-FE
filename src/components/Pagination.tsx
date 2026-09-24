import { NextIcon, PrevIcon } from './icons'

export function Pagination({
  page,
  totalPages,
  count,
  onChange,
}: {
  page: number
  totalPages: number
  count: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) {
    return (
      <p className="frequency__summary">
        {count} item{count === 1 ? '' : 's'}
      </p>
    )
  }

  return (
    <nav className="frequency" aria-label="Pagination">
      <button
        type="button"
        className="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        <PrevIcon size={14} />
        Previous
      </button>
      <span className="frequency__summary" aria-live="polite">
        Page {page} of {totalPages} · {count} items
      </span>
      <button
        type="button"
        className="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
        <NextIcon size={14} />
      </button>
    </nav>
  )
}
