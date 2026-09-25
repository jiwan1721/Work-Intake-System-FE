import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'

import { authApi } from '../api/auth'
import {
  clearTokens,
  getAccessToken,
  registerSessionExpiredHandler,
  setTokens,
} from '../api/tokens'
import type { AuthUser, RegisterRequest } from '../api/types'
import { AuthContext } from './authContextDef'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  // isLoading is true only when there is a stored token that needs validation.
  // When there is no token we already know the outcome synchronously.
  const [isLoading, setIsLoading] = useState(() => !!getAccessToken())
  const navigate = useNavigate()

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
    void navigate('/login', { replace: true })
  }, [navigate])

  // Register the callback so client.ts can trigger logout without React deps.
  useEffect(() => {
    registerSessionExpiredHandler(logout)
  }, [logout])

  // On mount, validate any stored access token and hydrate the user.
  useEffect(() => {
    const token = getAccessToken()
    if (!token) return // isLoading already false from lazy initializer
    void authApi
      .me()
      .then((u) => setUser(u))
      .catch(() => clearTokens())
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password)
    setTokens(data.access, data.refresh)
    setUser(data.user)
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await authApi.register(data)
    setTokens(response.access, response.refresh)
    setUser(response.user)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
