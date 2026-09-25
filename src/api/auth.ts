import { request } from './client'
import type { AuthUser, LoginResponse, RegisterRequest } from './types'

export const authApi = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: RegisterRequest) =>
    request<LoginResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
        confirm_password: data.confirmPassword,
      }),
    }),

  me: () => request<AuthUser>('/auth/me/'),

  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (uid: string, token: string, password: string, confirmPassword: string) =>
    request<{ message: string }>('/auth/reset-password/', {
      method: 'POST',
      body: JSON.stringify({ uid, token, password, confirm_password: confirmPassword }),
    }),

  changePassword: (oldPassword: string, newPassword: string, confirmPassword: string) =>
    request<{ message: string }>('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    }),
}
