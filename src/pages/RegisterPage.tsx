import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

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

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isPending, setIsPending] = useState(false)

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!firstName.trim()) errors['firstName'] = 'First name is required.'
    if (!lastName.trim()) errors['lastName'] = 'Last name is required.'
    if (password.length < 8) errors['password'] = 'Password must be at least 8 characters.'
    if (password !== confirmPassword) errors['confirmPassword'] = 'Passwords do not match.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!validate()) return

    setIsPending(true)
    try {
      await register({ firstName, lastName, email, password, confirmPassword })
      void navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        const details = err.details as Record<string, string[]>
        // Backend keys are snake_case (first_name, last_name, confirm_password);
        // map them back to the camelCase input field IDs.
        const snakeToCamel: Record<string, string> = {
          first_name: 'firstName',
          last_name: 'lastName',
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
          err instanceof ApiError ? err.message : 'Unable to register. Check your connection.',
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
          <p className="auth-brand__tagline">AI-assisted work intake</p>
        </div>

        <h2 className="auth-heading">Create your account</h2>

        {error ? (
          <div className="auth-form-banner auth-form-banner--error" role="alert">
            {error}
          </div>
        ) : null}

        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="firstName">
                First name
              </label>
              <input
                id="firstName"
                type="text"
                className={`form-input${fieldErrors['firstName'] ? ' form-input--error' : ''}`}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Alex"
                required
                autoComplete="given-name"
                autoFocus
              />
              {fieldErrors['firstName'] ? (
                <span className="form-error">{fieldErrors['firstName']}</span>
              ) : null}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="lastName">
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                className={`form-input${fieldErrors['lastName'] ? ' form-input--error' : ''}`}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Smith"
                required
                autoComplete="family-name"
              />
              {fieldErrors['lastName'] ? (
                <span className="form-error">{fieldErrors['lastName']}</span>
              ) : null}
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="reg-email">
              Email address
            </label>
            <input
              id="reg-email"
              type="email"
              className={`form-input${fieldErrors['email'] ? ' form-input--error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            {fieldErrors['email'] ? (
              <span className="form-error">{fieldErrors['email']}</span>
            ) : null}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="reg-password">
              Password
            </label>
            <div className="input-wrapper">
              <input
                id="reg-password"
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
            <label className="form-label" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              className={`form-input${fieldErrors['confirmPassword'] ? ' form-input--error' : ''}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
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
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>

        <p className="auth-alt">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
