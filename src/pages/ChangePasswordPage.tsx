import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { authApi } from '../api/auth'
import { ApiError } from '../api/client'
import { useToast } from '../components/feedback/toastContext'
import { useAuth } from '../contexts/authContextDef'

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

export function ChangePasswordPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const errors: Record<string, string> = {}
    if (!oldPassword) errors['oldPassword'] = 'Current password is required.'
    if (newPassword.length < 8) errors['newPassword'] = 'Password must be at least 8 characters.'
    if (newPassword !== confirmPassword)
      errors['confirmPassword'] = 'Passwords do not match.'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsPending(true)
    try {
      await authApi.changePassword(oldPassword, newPassword, confirmPassword)
      // Spec Flow 5: the backend rotates credentials, so we sign the user out
      // and send them back to /login with a toast.
      showToast('Password changed. Please sign in with your new password.', 'info')
      logout()
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        const details = err.details as Record<string, string[]>
        const snakeToCamel: Record<string, string> = {
          old_password: 'oldPassword',
          new_password: 'newPassword',
          confirm_password: 'confirmPassword',
        }
        const mapped: Record<string, string> = {}
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
            : 'Unable to change password. Check your connection.',
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

        <h2 className="auth-heading">Change your password</h2>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            marginTop: 0,
            marginBottom: '1.25rem',
          }}
        >
          After changing your password you&apos;ll need to sign in again.
        </p>

        {error ? (
          <div className="auth-form-banner auth-form-banner--error" role="alert">
            {error}
          </div>
        ) : null}

        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <div className="form-field">
            <label className="form-label" htmlFor="old-password">
              Current password
            </label>
            <div className="input-wrapper">
              <input
                id="old-password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input${fieldErrors['oldPassword'] ? ' form-input--error' : ''}`}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
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
            {fieldErrors['oldPassword'] ? (
              <span className="form-error">{fieldErrors['oldPassword']}</span>
            ) : null}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="new-password">
              New password
            </label>
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              className={`form-input${fieldErrors['newPassword'] ? ' form-input--error' : ''}`}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
            />
            {fieldErrors['newPassword'] ? (
              <span className="form-error">{fieldErrors['newPassword']}</span>
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

          <div className="form-actions" style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="button"
              onClick={() => void navigate(-1)}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button--primary"
              style={{ flex: 1, justifyContent: 'center' }}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <span className="spinner spinner--inline" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                'Change password'
              )}
            </button>
          </div>
        </form>

        <p className="auth-alt">
          <Link to="/">Back to workbench</Link>
        </p>
      </div>
    </div>
  )
}
