import { Navigate, useLocation } from 'react-router'

import { useAuth } from '../../contexts/authContextDef'
import { LoadingBlock } from '../feedback/Feedback'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="auth-layout">
        <LoadingBlock label="Loading…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Preserve the attempted URL so login can redirect back after success.
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
