import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'

const LENGTH = 6

interface OtpInputProps {
  value: string
  onChange: (next: string) => void
  /** Prefix for each input id — needed so the outer <label htmlFor> resolves. */
  idPrefix: string
  autoFocus?: boolean
  invalid?: boolean
  disabled?: boolean
}

/**
 * A six-box numeric OTP input that behaves the way people expect: typing
 * moves focus forward, Backspace on an empty box moves back, and pasting a
 * 6-digit code fills every box in one go.
 *
 * The digits are the source of truth; the parent owns `value` as a plain
 * 6-char string so submit handlers don't have to reassemble an array.
 */
export function OtpInput({
  value,
  onChange,
  idPrefix,
  autoFocus,
  invalid,
  disabled,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (autoFocus) inputRefs.current[0]?.focus()
  }, [autoFocus])

  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? '')

  const commit = (nextDigits: string[]) => {
    // Trim trailing empties so `value.length === 6` is a real "complete" flag.
    const joined = nextDigits.join('').replace(/\s/g, '')
    onChange(joined)
  }

  const handleChange = (index: number, raw: string) => {
    // Accept the last typed digit only; browsers can deliver a longer value
    // when a mobile keyboard suggests the OTP.
    const digit = raw.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    commit(next)
    if (digit && index < LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
      inputRefs.current[index + 1]?.select()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) return // let the default clear the current box
      if (index === 0) return
      e.preventDefault()
      const next = [...digits]
      next[index - 1] = ''
      commit(next)
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < LENGTH - 1) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '')
    if (!pasted) return
    e.preventDefault()
    const next = [...digits]
    for (let i = 0; i < pasted.length && index + i < LENGTH; i++) {
      next[index + i] = pasted.charAt(i)
    }
    commit(next)
    const focusIndex = Math.min(index + pasted.length, LENGTH - 1)
    inputRefs.current[focusIndex]?.focus()
    inputRefs.current[focusIndex]?.select()
  }

  return (
    <div className={`otp-input${invalid ? ' otp-input--invalid' : ''}`} role="group" aria-label="Verification code">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el
          }}
          id={`${idPrefix}-${i}`}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          className="otp-input__box"
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${LENGTH}`}
        />
      ))}
    </div>
  )
}
