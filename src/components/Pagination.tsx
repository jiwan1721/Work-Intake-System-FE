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
      <p className="pagination__summary">
        {count} item{count === 1 ? '' : 's'}
      </p>
    )
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="button button--secondary"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        Previous
      </button>
      <span className="pagination__summary" aria-live="polite">
        Page {page} of {totalPages} · {count} items
      </span>
      <button
        type="button"
        className="button button--secondary"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </nav>
  )
}
