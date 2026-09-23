import { createContext, useContext } from 'react'

export type ToastTone = 'info' | 'error'

export interface Toast {
  id: number
  message: string
  tone: ToastTone
}

export interface ToastApi {
  showToast: (message: string, tone?: ToastTone) => void
}

export const ToastContext = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used inside <ToastProvider>')
  }
  return context
}
