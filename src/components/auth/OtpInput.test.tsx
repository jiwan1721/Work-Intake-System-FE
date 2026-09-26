/** Six-box OTP input: focus movement, backspace, paste, non-numeric rejection. */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, test } from 'vitest'

import { OtpInput } from './OtpInput'

function Harness({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  return (
    <>
      <OtpInput value={value} onChange={setValue} idPrefix="t" autoFocus />
      <span data-testid="mirror">{value}</span>
    </>
  )
}

function boxes() {
  return screen.getAllByRole('textbox') as HTMLInputElement[]
}

describe('OtpInput', () => {
  test('renders six independent boxes with accessible labels', () => {
    render(<Harness />)
    const inputs = boxes()
    expect(inputs).toHaveLength(6)
    expect(inputs[0]).toHaveAccessibleName(/digit 1 of 6/i)
    expect(inputs[5]).toHaveAccessibleName(/digit 6 of 6/i)
  })

  test('typing a digit fills the box and advances focus', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const [b0, b1] = boxes()

    await user.type(b0, '3')

    expect(b0).toHaveValue('3')
    expect(b1).toHaveFocus()
    expect(screen.getByTestId('mirror')).toHaveTextContent('3')
  })

  test('non-numeric input is rejected', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const [b0] = boxes()

    await user.type(b0, 'a')

    expect(b0).toHaveValue('')
    expect(screen.getByTestId('mirror')).toHaveTextContent('')
  })

  test('backspace on an empty box moves focus to the previous box and clears it', async () => {
    const user = userEvent.setup()
    render(<Harness initial="12" />)
    const [b0, b1, b2] = boxes()

    b2.focus()
    await user.keyboard('{Backspace}')

    expect(b1).toHaveFocus()
    expect(b1).toHaveValue('')
    expect(b0).toHaveValue('1')
    expect(screen.getByTestId('mirror')).toHaveTextContent('1')
  })

  test('pasting a 6-digit code fills every box in one go', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const [b0, b1, b2, b3, b4, b5] = boxes()

    b0.focus()
    await user.paste('123456')

    expect(b0).toHaveValue('1')
    expect(b1).toHaveValue('2')
    expect(b2).toHaveValue('3')
    expect(b3).toHaveValue('4')
    expect(b4).toHaveValue('5')
    expect(b5).toHaveValue('6')
    expect(b5).toHaveFocus()
    expect(screen.getByTestId('mirror')).toHaveTextContent('123456')
  })

  test('paste strips non-numeric characters', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const [b0] = boxes()

    b0.focus()
    await user.paste('12-34 56')

    expect(screen.getByTestId('mirror')).toHaveTextContent('123456')
  })

  test('arrow keys move focus between boxes', async () => {
    const user = userEvent.setup()
    render(<Harness initial="12" />)
    const [, b1, b2] = boxes()

    b1.focus()
    await user.keyboard('{ArrowRight}')
    expect(b2).toHaveFocus()

    await user.keyboard('{ArrowLeft}')
    expect(b1).toHaveFocus()
  })
})
