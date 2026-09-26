import { screen } from '@testing-library/react'
import { expect, test } from 'vitest'

import App from './App'
import { renderApp } from './test/utils'

test('renders the app shell when authenticated', async () => {
  // Pre-seed tokens so AuthProvider validates the session and renders the
  // work-items page instead of redirecting to /login.
  localStorage.setItem('wis_access', 'test-access-token')
  localStorage.setItem('wis_refresh', 'test-refresh-token')

  renderApp(<App />)

  // The TriageDesk heading and empty state both come from WorkItemsPage.
  expect(await screen.findByRole('heading', { name: /triagedesk/i })).toBeInTheDocument()
  expect(await screen.findByText(/no work items yet/i)).toBeInTheDocument()
})
