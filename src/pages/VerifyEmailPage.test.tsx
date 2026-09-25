/** OTP verification: happy path, error mapping, resend cooldown, guard. */

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, test, vi } from 'vitest'

import App from '../App'
import { server } from '../test/server'
import { errorBody, renderApp } from '../test/utils'

const USER = {
  id: 42,
  email: 'jane@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  fullName: 'Jane Doe',
  isActive: true,
  dateJoined: '2026-09-25T10:00:00Z',
}

const VERIFY_EMAIL_ROUTE = {
  pathname: '/verify-email',
  state: { email: 'jane@example.com', justRegistered: true },
}

afterEach(() => {
  vi.useRealTimers()
})

/** Type the code from box 0 forward. The input hands focus to the next box on
 *  each keystroke, so we only need to focus once. */
async function typeCode(user: ReturnType<typeof userEvent.setup>, code: string) {
  const boxes = screen.getAllByRole('textbox') as HTMLInputElement[]
  boxes[0].focus()
  await user.keyboard(code)
}

describe('VerifyEmailPage', () => {
  test('redirects to /register when no email is in state', async () => {
    renderApp(<App />, { route: '/verify-email' })

    // Landing on /register with no auth state shows the "Create your account" heading.
    expect(await screen.findByText(/create your account/i)).toBeInTheDocument()
  })

  test('shows the emailed address so the user knows where to look', async () => {
    renderApp(<App />, { route: VERIFY_EMAIL_ROUTE })

    expect(await screen.findByRole('heading', { name: /verify your email/i })).toBeInTheDocument()
    expect(screen.getByText(/jane@example\.com/)).toBeInTheDocument()
    // The just-registered banner is only shown when we arrive from /register.
    expect(screen.getByText(/account created/i)).toBeInTheDocument()
  })

  test('a correct code stores tokens and lands on the workbench', async () => {
    const user = userEvent.setup()
    let posted: unknown = null

    server.use(
      http.post('/api/v1/auth/verify-email/', async ({ request }) => {
        posted = await request.json()
        return HttpResponse.json({ access: 'A', refresh: 'R', user: USER })
      }),
      http.get('/api/v1/work-items', () =>
        HttpResponse.json({ count: 0, page: 1, pageSize: 20, totalPages: 1, results: [] }),
      ),
    )

    renderApp(<App />, { route: VERIFY_EMAIL_ROUTE })
    await screen.findByRole('heading', { name: /verify your email/i })
    await typeCode(user, '123456')

    await user.click(screen.getByRole('button', { name: /verify email/i }))

    // Verify tokens landed in storage and we're on the workbench.
    await screen.findByRole('heading', { name: /triagedesk/i })
    expect(localStorage.getItem('wis_access')).toBe('A')
    expect(localStorage.getItem('wis_refresh')).toBe('R')
    expect(posted).toEqual({ email: 'jane@example.com', otp: '123456' })
  })

  test('the submit button stays disabled until 6 digits are entered', async () => {
    const user = userEvent.setup()
    renderApp(<App />, { route: VERIFY_EMAIL_ROUTE })

    const submit = await screen.findByRole('button', { name: /verify email/i })
    expect(submit).toBeDisabled()

    await fillOtp(user, '12345')
    expect(submit).toBeDisabled()

    await fillOtp(user, '6')
    expect(submit).toBeEnabled()
  })

  test('a 400 with details.otp shows the field-scoped error message', async () => {
    const user = userEvent.setup()
    server.use(
      http.post('/api/v1/auth/verify-email/', () =>
        HttpResponse.json(
          errorBody('VALIDATION_ERROR', 'Validation failed.', {
            otp: ['Invalid or expired verification code.'],
          }),
          { status: 400 },
        ),
      ),
    )

    renderApp(<App />, { route: VERIFY_EMAIL_ROUTE })
    await screen.findByRole('heading', { name: /verify your email/i })
    await fillOtp(user, '000000')
    await user.click(screen.getByRole('button', { name: /verify email/i }))

    expect(await screen.findByText(/invalid or expired verification code/i)).toBeInTheDocument()
    // Tokens were never set on an unsuccessful verify.
    expect(localStorage.getItem('wis_access')).toBeNull()
  })

  test('Resend triggers the endpoint and enters a 60s countdown', async () => {
    // Fake timers so the countdown ticks predictably. userEvent needs advance-time.
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    let resends = 0

    server.use(
      http.post('/api/v1/auth/resend-otp/', () => {
        resends += 1
        return HttpResponse.json({
          message: 'If an unverified account with that email exists, a new code has been sent.',
        })
      }),
    )

    renderApp(<App />, { route: VERIFY_EMAIL_ROUTE })
    const resend = await screen.findByRole('button', { name: /resend code/i })

    await user.click(resend)

    // Server was called and the banner updated with the always-success message.
    await waitFor(() => expect(resends).toBe(1))
    expect(
      screen.getByText(/if an unverified account with that email exists/i),
    ).toBeInTheDocument()

    // The button is now disabled and shows a countdown.
    const disabled = screen.getByRole('button', { name: /resend in \d+s/i })
    expect(disabled).toBeDisabled()

    // Advance ~59s: still disabled.
    await vi.advanceTimersByTimeAsync(58_000)
    expect(screen.getByRole('button', { name: /resend in \d+s/i })).toBeDisabled()

    // Past the 60s mark: the label goes back to "Resend code" and it's enabled.
    await vi.advanceTimersByTimeAsync(3_000)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resend code/i })).toBeEnabled()
    })
    expect(resends).toBe(1)
  })
})
