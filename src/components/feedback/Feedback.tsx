import type { ReactNode } from 'react'

import { describeError } from './describeError'

/**
 * A service in motion rather than a spinning circle: the working indicator is
 * a segment travelling a track, which is the same grammar the queue uses.
 */
export function Spinner({ label = 'Loading' }: { label?: string }) {
  return <span className="progress" role="img" aria-label={label} />
}

/**
 * Absence drawn as deliberately as presence: ghost rows at the height real
 * rows will occupy, so the queue does not jump when the data lands.
 */
export function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="notice notice--loading" role="status">
      <p className="notice__title">
        <Spinner label="" /> {label}
      </p>
      <span className="notice__ghosts" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
    </div>
  )
}

/** An empty corridor is a route with no services on it, not a dashed card. */
export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="notice notice--empty">
      <p className="notice__title">{title}</p>
      {hint ? <p className="notice__hint">{hint}</p> : null}
    </div>
  )
}

export function ErrorBanner({
  error,
  onRetry,
  children,
}: {
  error: unknown
  onRetry?: () => void
  children?: ReactNode
}) {
  const { title, detail } = describeError(error)
  return (
    <div className="alert" role="alert">
      <div>
        <p className="alert__title">{title}</p>
        <p className="alert__detail">{detail}</p>
        {children}
      </div>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="button">
          Try again
        </button>
      ) : null}
    </div>
  )
}
