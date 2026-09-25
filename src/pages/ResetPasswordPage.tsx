import { useState } from 'react'
import { Link, useParams } from 'react-router'

import { ApiError } from '../api/client'
import { authApi } from '../api/auth'

const EyeIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

export function ResetPasswordPage() {
  const { uid, token } = useParams<{ uid: string; token: string }>()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldError(null)

    if (password.length < 8) {
      setFieldError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setFieldError('Passwords do not match.')
      return
    }

    if (!uid || !token) {
      setError('Invalid reset link. Please request a new one.')
      return
    }

    setIsPending(true)
    try {
      await authApi.resetPassword(uid, token, password, confirmPassword)
      setSuccess(true)
    } catch (err) {
      if (err instanceof ApiError && (err.status === 400 || err.status === 404)) {
        setError('This reset link is invalid or has expired. Please request a new one.')
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : 'Unable to reset password. Check your connection.',
        )
      }
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

        {success ? (
          <>
            <div className="auth-form-banner auth-form-banner--success" role="status">
              Your password has been reset successfully.
            </div>
            <div className="form-actions">
              <Link to="/login" className="button button--primary button--full" style={{ textDecoration: 'none', textAlign: 'center' }}>
                Sign in with new password
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="auth-heading">Set a new password</h2>

            {error ? (
              <div className="auth-form-banner auth-form-banner--error" role="alert">
                {error}
                {error.includes('request a new one') ? (
                  <>
                    {' '}
                    <Link to="/forgot-password" className="auth-forgot-link">
                      Request new link
                    </Link>
                  </>
                ) : null}
              </div>
            ) : null}

            <form onSubmit={(e) => void handleSubmit(e)} noValidate>
              <div className="form-field">
                <label className="form-label" htmlFor="new-password">
                  New password
                </label>
                <div className="input-wrapper">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input${fieldError ? ' form-input--error' : ''}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    className="input-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? EyeOffIcon : EyeIcon}
                  </button>
                </div>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="confirm-new-password">
                  Confirm new password
                </label>
                <input
                  id="confirm-new-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input${fieldError ? ' form-input--error' : ''}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  autoComplete="new-password"
                />
                {fieldError ? <span className="form-error">{fieldError}</span> : null}
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
                      Resetting…
                    </>
                  ) : (
                    'Reset password'
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
