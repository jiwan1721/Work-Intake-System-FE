import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'

import { authApi } from '../api/auth'
import { ApiError } from '../api/client'
import { OtpInput } from '../components/auth/OtpInput'
import { useToast } from '../components/feedback/toastContext'

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
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const email = (location.state as { email?: string } | null)?.email

  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  // If someone lands here without going through Forgot Password, bounce them
  // back — the email is required and only lives in router state.
  if (!email) {
    return <Navigate to="/forgot-password" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const errors: Record<string, string> = {}
    if (otp.length !== 6) errors['otp'] = 'Enter the 6-digit code from your email.'
    if (password.length < 8) errors['password'] = 'Password must be at least 8 characters.'
    if (password !== confirmPassword) errors['confirmPassword'] = 'Passwords do not match.'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsPending(true)
    try {
      await authApi.resetPassword(email, otp, password, confirmPassword)
      showToast('Password reset successfully. Please sign in.', 'info')
      void navigate('/login', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        const details = err.details as Record<string, string[]>
        const mapped: Record<string, string> = {}
        const snakeToCamel: Record<string, string> = { confirm_password: 'confirmPassword' }
        for (const [key, msgs] of Object.entries(details)) {
          if (!Array.isArray(msgs)) continue
          const field = snakeToCamel[key] ?? key
          mapped[field] = msgs[0] ?? ''
        }
        if (Object.keys(mapped).length > 0) {
          setFieldErrors(mapped)
        } else {
          setError(err.message)
        }
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

        <h2 className="auth-heading">Set a new password</h2>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            marginTop: 0,
            marginBottom: '1.25rem',
          }}
        >
          We sent a 6-digit code to <strong>{email}</strong>. It expires in 10 minutes.
        </p>
        <b>
          Use this code for now: 123456
        </b>

        {error ? (
          <div className="auth-form-banner auth-form-banner--error" role="alert">
            {error}
          </div>
        ) : null}

        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <div className="form-field">
            <label className="form-label" htmlFor="reset-otp-0">
              Reset code
            </label>
            <OtpInput
              value={otp}
              onChange={(next) => {
                setOtp(next)
                setFieldErrors((f) => (f['otp'] ? { ...f, otp: '' } : f))
              }}
              idPrefix="reset-otp"
              invalid={!!fieldErrors['otp']}
              autoFocus
            />
            {fieldErrors['otp'] ? (
              <span className="form-error">{fieldErrors['otp']}</span>
            ) : null}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="new-password">
              New password
            </label>
            <div className="input-wrapper">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input${fieldErrors['password'] ? ' form-input--error' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                autoComplete="new-password"
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
            {fieldErrors['password'] ? (
              <span className="form-error">{fieldErrors['password']}</span>
            ) : null}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="confirm-new-password">
              Confirm new password
            </label>
            <input
              id="confirm-new-password"
              type={showPassword ? 'text' : 'password'}
              className={`form-input${fieldErrors['confirmPassword'] ? ' form-input--error' : ''}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              required
              autoComplete="new-password"
            />
            {fieldErrors['confirmPassword'] ? (
              <span className="form-error">{fieldErrors['confirmPassword']}</span>
            ) : null}
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
          Didn&apos;t get a code? <Link to="/forgot-password">Request a new one</Link>
        </p>
      </div>
    </div>
  )
}
