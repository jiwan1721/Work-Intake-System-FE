import type { ReactNode } from 'react'

import { describeError } from './describeError'

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return <span className="spinner" role="img" aria-label={label} />
}

export function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="state-block">
      <Spinner label="" />
      <p>{label}</p>
    </div>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="state-block state-block--empty">
      <p className="state-block__title">{title}</p>
      {hint ? <p className="state-block__hint">{hint}</p> : null}
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
    <div className="banner banner--error" role="alert">
      <div>
        <p className="banner__title">{title}</p>
        <p className="banner__detail">{detail}</p>
        {children}
      </div>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="button button--secondary">
          Try again
        </button>
      ) : null}
    </div>
  )
}
