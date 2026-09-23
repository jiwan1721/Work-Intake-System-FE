import { screen } from '@testing-library/react'
import { expect, test } from 'vitest'

import App from './App'
import { renderApp } from './test/utils'

test('renders the app shell', async () => {
  renderApp(<App />)

  expect(screen.getByRole('heading', { name: /triagedesk/i })).toBeInTheDocument()
  // The default MSW handler returns an empty list.
  expect(await screen.findByText(/no work items yet/i)).toBeInTheDocument()
})
