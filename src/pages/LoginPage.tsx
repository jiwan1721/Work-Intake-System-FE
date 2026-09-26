import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'

import { ApiError } from '../api/client'
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

// The backend returns a plain-text `detail` for 401s (Flow 2). Matching the
// message is the only way to distinguish "inactive" from "wrong password" —
// the code isn't specified — and it's what triggers the resend-OTP link.
function isInactiveAccountError(err: ApiError): boolean {
  return err.status === 401 && /inactive|verify your email/i.test(err.message)
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setNeedsVerification(false)
    setIsPending(true)
    try {
      await login(email, password)
      void navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        if (isInactiveAccountError(err)) setNeedsVerification(true)
      } else {
        setError('Unable to sign in. Check your connection.')
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
          <p className="auth-brand__tagline">AI-assisted work intake</p>
        </div>

        <h2 className="auth-heading">Sign in to your account</h2>

        {error ? (
          <div className="auth-form-banner auth-form-banner--error" role="alert">
            {error}
            {needsVerification ? (
              <>
                {' '}
                <Link
                  to="/verify-email"
                  state={{ email }}
                  className="auth-forgot-link"
                >
                  Resend verification code
                </Link>
              </>
            ) : null}
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

          <div className="form-field">
            <div className="form-label-row">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <Link to="/forgot-password" className="auth-forgot-link">
                Forgot password?
              </Link>
            </div>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
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

          <div className="form-actions">
            <button
              type="submit"
              className="button button--primary button--full"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <span className="spinner spinner--inline" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        <p className="auth-alt">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}
