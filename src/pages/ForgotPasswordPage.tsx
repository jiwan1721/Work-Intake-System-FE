import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { authApi } from '../api/auth'
import { ApiError } from '../api/client'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsPending(true)
    try {
      // The endpoint always returns 200 (Flow 4 step 1). We move to the reset
      // screen unconditionally to avoid leaking whether the email exists.
      await authApi.forgotPassword(email)
      void navigate('/reset-password', { state: { email } })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Unable to send a reset code. Check your connection.',
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

        <h2 className="auth-heading">Reset your password</h2>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            marginTop: 0,
            marginBottom: '1.25rem',
          }}
        >
          Enter the email you registered with. If we find an account, we&apos;ll send a 6-digit
          reset code.
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
                'Send reset code'
              )}
            </button>
          </div>
        </form>

        <p className="auth-alt">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
