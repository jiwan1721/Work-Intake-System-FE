import { Route, Routes } from 'react-router'

import { AuthGuard } from './components/auth/AuthGuard'
import { ToastProvider } from './components/feedback/ToastProvider'
import { AuthProvider } from './contexts/AuthContext'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { WorkItemsPage } from './pages/WorkItemsPage'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />

          {/* Protected routes — AuthGuard redirects to /login if not authenticated */}
          <Route
            path="/"
            element={
              <AuthGuard>
                <WorkItemsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/work-items"
            element={
              <AuthGuard>
                <WorkItemsPage />
              </AuthGuard>
            }
          />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  )
}
