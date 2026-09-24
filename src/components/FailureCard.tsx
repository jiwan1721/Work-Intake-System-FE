import type { WorkItemError } from '../api/types'

/**
 * An error code is for us; an operator needs to know whether to retry, wait,
 * or escalate. This is the translation.
 */
const EXPLANATIONS: Record<string, string> = {
  TIMEOUT: 'The AI model took too long to respond. Retrying usually works.',
  PROVIDER_ERROR:
    'The AI service was unavailable or rejected the request. Wait a moment, then retry.',
  INVALID_OUTPUT:
    'The AI returned something that did not match the expected format, so nothing was saved. ' +
    'Retrying asks it again.',
  STALE_ANALYSIS:
    'An earlier analysis was interrupted and never finished. Retrying starts a fresh one.',
  UNEXPECTED_ERROR:
    'Something went wrong on our side while analysing this item. If retrying does not help, ' +
    'escalate it.',
}

export function FailureCard({
  error,
  attemptCount,
  canRetry,
}: {
  error: WorkItemError
  attemptCount: number
  canRetry: boolean
}) {
  const explanation = EXPLANATIONS[error.code] ?? 'The analysis did not complete.'

  return (
    <section className="failure" aria-labelledby="failure-heading" role="alert">
      <h4 className="section__head" id="failure-heading">
        Analysis failed
      </h4>
      <p className="prose">{explanation}</p>

      <dl className="fields">
        <dt>Error code</dt>
        <dd>
          <code>{error.code}</code>
        </dd>

        <dt>Details</dt>
        <dd className="prose">{error.message}</dd>

        <dt>Attempts</dt>
        <dd>{attemptCount}</dd>
      </dl>

      {!canRetry ? (
        <p className="footnote">
          This item has used all of its analysis attempts. It needs to be handled manually.
        </p>
      ) : null}
    </section>
  )
}
