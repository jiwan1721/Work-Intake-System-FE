import { useState } from 'react'
import { Link } from 'react-router'

import { ApiError } from '../api/client'
import { authApi } from '../api/auth'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [successEmail, setSuccessEmail] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsPending(true)
    try {
      await authApi.forgotPassword(email)
      setSuccessEmail(email)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Unable to send reset link. Check your connection.',
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand__mark">TD</div>
          <h1 className="auth-brand__name">TriageDesk</h1>
        </div>

        {successEmail ? (
          <>
            <div className="auth-form-banner auth-form-banner--success" role="status">
              We&apos;ve sent a reset link to <strong>{successEmail}</strong>. Check your inbox —
              the link expires in 24 hours.
            </div>
            <p className="auth-alt" style={{ marginTop: '0.5rem' }}>
              <Link to="/login">Back to sign in</Link>
            </p>
          </>
        ) : (
          <>
            <h2 className="auth-heading">Reset your password</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '1.25rem' }}>
              Enter the email address you registered with and we&apos;ll send you a reset link.
            </p>

            {error ? (
              <div className="auth-form-banner auth-form-banner--error" role="alert">
                {error}
              </div>
            ) : null}

            <form onSubmit={(e) => void handleSubmit(e)} noValidate>
              <div className="form-field">
                <label className="form-label" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="button button--primary button--full"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <span className="spinner spinner--inline" aria-hidden="true" />
                      Sending…
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </div>
            </form>

            <p className="auth-alt">
              <Link to="/login">Back to sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
