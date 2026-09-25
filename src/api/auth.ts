import { request } from './client'
import type {
  AuthTokens,
  AuthUser,
  MessageResponse,
  RegisterRequest,
  RegisterResponse,
} from './types'

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthTokens>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: RegisterRequest) =>
    request<RegisterResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
        confirm_password: data.confirmPassword,
      }),
    }),

  verifyEmail: (email: string, otp: string) =>
    request<AuthTokens>('/auth/verify-email/', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  resendOtp: (email: string) =>
    request<MessageResponse>('/auth/resend-otp/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  me: () => request<AuthUser>('/auth/me/'),

  forgotPassword: (email: string) =>
    request<MessageResponse>('/auth/forgot-password/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, otp: string, password: string, confirmPassword: string) =>
    request<MessageResponse>('/auth/reset-password/', {
      method: 'POST',
      body: JSON.stringify({
        email,
        otp,
        password,
        confirm_password: confirmPassword,
      }),
    }),

  changePassword: (oldPassword: string, newPassword: string, confirmPassword: string) =>
    request<MessageResponse>('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    }),
}
