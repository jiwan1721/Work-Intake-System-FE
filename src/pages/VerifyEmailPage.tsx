import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'

import { authApi } from '../api/auth'
import { ApiError } from '../api/client'
import { OtpInput } from '../components/auth/OtpInput'
import { useToast } from '../components/feedback/toastContext'
import { useAuth } from '../contexts/authContextDef'

const RESEND_COOLDOWN_SECONDS = 60

export function VerifyEmailPage() {
  const { verifyEmail } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // Only /register / /login send us here with state; fall back if missing.
  const state = location.state as { email?: string; justRegistered?: boolean } | null
  const email = state?.email

  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(
    state?.justRegistered ? 'Account created. Enter the 6-digit code we emailed you.' : null,
  )
  const [isPending, setIsPending] = useState(false)
  const [resendPending, setResendPending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Client-side cooldown tick. The API is idempotent, but the UX brief calls
  // for exactly 60s between button presses (Flow 1: Resend OTP).
  const intervalRef = useRef<number | null>(null)
  useEffect(() => {
    if (cooldown <= 0) return
    intervalRef.current = window.setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1))
    }, 1000)
    return () => {
      if (intervalRef.current != null) window.clearInterval(intervalRef.current)
    }
  }, [cooldown])

  if (!email) {
    return <Navigate to="/register" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setOtpError(null)
    if (otp.length !== 6) {
      setOtpError('Enter the 6-digit code from your email.')
      return
    }
    setIsPending(true)
    try {
      await verifyEmail(email, otp)
      // Verification returns tokens; go straight to the workbench.
      void navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        const details = err.details as Record<string, string[]>
        const otpMsg = details['otp']?.[0]
        if (otpMsg) {
          setOtpError(otpMsg)
        } else {
          setError(err.message)
        }
      } else {
        setError(
          err instanceof ApiError ? err.message : 'Unable to verify. Check your connection.',
        )
      }
    } finally {
      setIsPending(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0 || resendPending) return
    setResendPending(true)
    setError(null)
    try {
      const response = await authApi.resendOtp(email)
      // Server always returns 200 for privacy (Flow 1). The message is safe
      // to show verbatim — it doesn't confirm the email exists.
      setBanner(response.message)
      setCooldown(RESEND_COOLDOWN_SECONDS)
      setOtp('')
      setOtpError(null)
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to resend the code. Check your connection.',
        'error',
      )
    } finally {
      setResendPending(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand__mark">TD</div>
          <h1 className="auth-brand__name">TriageDesk</h1>
        </div>

        <h2 className="auth-heading">Verify your email</h2>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            marginTop: 0,
            marginBottom: '1.25rem',
          }}
        >
          Enter the 6-digit code we sent to <strong>{email}</strong>. Codes expire in 10 minutes.
          <br />
          <br />
          Use this code 123456 for now
        </p>

        {banner ? (
          <div className="auth-form-banner auth-form-banner--success" role="status">
            {banner}
          </div>
        ) : null}

        {error ? (
          <div className="auth-form-banner auth-form-banner--error" role="alert">
            {error}
          </div>
        ) : null}

        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <div className="form-field">
            <label className="form-label" htmlFor="verify-otp-0">
              Verification code
            </label>
            <OtpInput
              value={otp}
              onChange={(next) => {
                setOtp(next)
                if (otpError) setOtpError(null)
              }}
              idPrefix="verify-otp"
              invalid={!!otpError}
              autoFocus
            />
            {otpError ? <span className="form-error">{otpError}</span> : null}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="button button--primary button--full"
              disabled={isPending || otp.length !== 6}
            >
              {isPending ? (
                <>
                  <span className="spinner spinner--inline" aria-hidden="true" />
                  Verifying…
                </>
              ) : (
                'Verify email'
              )}
            </button>
          </div>
        </form>

        <div className="auth-resend">
          <span>Didn&apos;t get the code?</span>{' '}
          <button
            type="button"
            className="link-button"
            onClick={() => void handleResend()}
            disabled={cooldown > 0 || resendPending}
          >
            {resendPending
              ? 'Sending…'
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : 'Resend code'}
          </button>
        </div>

        <p className="auth-alt">
          Wrong email? <Link to="/register">Start over</Link>
        </p>
      </div>
    </div>
  )
}
