import { useState, type FormEvent } from 'react'

import { ApiError } from '../api/client'
import { useCreateWorkItem } from '../hooks/useCreateWorkItem'
import { Spinner } from './feedback/Feedback'
import { useToast } from './feedback/toastContext'

interface FieldErrors {
  external_id?: string
  title?: string
  description?: string
  form?: string
}

const DESCRIPTION_MAX = 2000

function firstMessage(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}

function fieldErrorsFrom(error: unknown): FieldErrors {
  if (!(error instanceof ApiError)) {
    return { form: 'Something went wrong. Please try again.' }
  }

  if (error.code === 'DUPLICATE_CONFLICT') {
    return { external_id: 'An item with this external ID already exists.' }
  }

  if (error.code === 'VALIDATION_ERROR') {
    const details = error.details
    return {
      external_id: firstMessage(details.external_id),
      title: firstMessage(details.title),
      description: firstMessage(details.description),
    }
  }

  return { form: error.message }
}

export function NewWorkItemForm({
  onCreated,
  onCancel,
}: {
  onCreated?: (id: string) => void
  onCancel?: () => void
}) {
  const [externalId, setExternalId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const { showToast } = useToast()
  const mutation = useCreateWorkItem()

  const isPending = mutation.isPending

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    mutation.mutate(
      {
        external_id: externalId.trim(),
        title: title.trim(),
        description: description.trim(),
      },
      {
        onSuccess: (item) => {
          setExternalId('')
          setTitle('')
          setDescription('')
          setErrors({})
          showToast(`Created ${item.external_id}`)
          onCreated?.(item.id)
        },
        onError: (error) => {
          setErrors(fieldErrorsFrom(error))
        },
      },
    )
  }

  return (
    <section className="intake" aria-labelledby="intake-title">
      <header className="intake__header">
        <h2 id="intake-title" className="intake__title">
          Create a work item
        </h2>
        <p className="intake__subtitle">
          New items enter the queue as <strong>Received</strong> and can be sent for analysis.
        </p>
      </header>

      <form className="intake__body" onSubmit={onSubmit} noValidate>
        {errors.form ? (
          <div className="auth-form-banner auth-form-banner--error" role="alert">
            {errors.form}
          </div>
        ) : null}

        <div className="intake__grid">
          <div className="form-field">
            <label htmlFor="new-external-id" className="form-label">
              External ID
            </label>
            <input
              id="new-external-id"
              type="text"
              value={externalId}
              onChange={(e) => setExternalId(e.target.value)}
              className={`form-input${errors.external_id ? ' form-input--error' : ''}`}
              placeholder="CRM-1234"
              autoComplete="off"
              spellCheck={false}
              required
              disabled={isPending}
              aria-invalid={errors.external_id ? true : undefined}
              aria-describedby={
                errors.external_id ? 'new-external-id-error' : 'new-external-id-hint'
              }
            />
            {errors.external_id ? (
              <span id="new-external-id-error" className="form-error" role="alert">
                {errors.external_id}
              </span>
            ) : (
              <span id="new-external-id-hint" className="form-hint">
                The identifier from the source system. Must be unique.
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="new-title" className="form-label">
              Title
            </label>
            <input
              id="new-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`form-input${errors.title ? ' form-input--error' : ''}`}
              placeholder="Missing income document"
              required
              disabled={isPending}
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={errors.title ? 'new-title-error' : undefined}
            />
            {errors.title ? (
              <span id="new-title-error" className="form-error" role="alert">
                {errors.title}
              </span>
            ) : null}
          </div>
        </div>

        <div className="form-field">
          <div className="form-label-row">
            <label htmlFor="new-description" className="form-label">
              Description
            </label>
            <span
              className={`form-hint form-hint--count${
                description.length > DESCRIPTION_MAX ? ' form-hint--over' : ''
              }`}
              aria-live="polite"
            >
              {description.length} / {DESCRIPTION_MAX}
            </span>
          </div>
          <textarea
            id="new-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`form-input form-input--textarea${
              errors.description ? ' form-input--error' : ''
            }`}
            placeholder="What happened, what the operator needs, and any context the analyst should know."
            rows={4}
            maxLength={DESCRIPTION_MAX}
            required
            disabled={isPending}
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={errors.description ? 'new-description-error' : undefined}
          />
          {errors.description ? (
            <span id="new-description-error" className="form-error" role="alert">
              {errors.description}
            </span>
          ) : null}
        </div>

        <footer className="intake__footer">
          {onCancel ? (
            <button
              type="button"
              className="button"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancel
            </button>
          ) : null}
          <button
            type="submit"
            className="button button--primary"
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? (
              <>
                <Spinner label="" />
                Creating…
              </>
            ) : (
              'Create item'
            )}
          </button>
        </footer>
      </form>
    </section>
  )
}
