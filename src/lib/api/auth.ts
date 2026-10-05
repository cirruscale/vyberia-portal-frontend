import { api } from './client'
import type { ApiResponse, AuthOutput, User } from '../types'

// Portal Auth
export const portalAuth = {
  register: (data: { name: string; email: string; phone?: string; password: string }) =>
    api.post<ApiResponse<AuthOutput>>('/api/v1/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthOutput>>('/api/v1/auth/login', data),

  refresh: (refresh_token: string) =>
    api.post<ApiResponse<AuthOutput>>('/api/v1/auth/refresh', { refresh_token }),

  me: () =>
    api.get<ApiResponse<User>>('/api/v1/auth/me', { auth: true }),

  updateProfile: (data: { name?: string; phone?: string }) =>
    api.put<ApiResponse<User>>('/api/v1/auth/profile', data, { auth: true }),

  changePassword: (data: { old_password: string; new_password: string }) =>
    api.put<ApiResponse<void>>('/api/v1/auth/change-password', data, { auth: true }),
}

// CMS Auth
export const cmsAuth = {
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthOutput>>('/api/v1/cms/auth/login', data),

  refresh: (refresh_token: string) =>
    api.post<ApiResponse<AuthOutput>>('/api/v1/cms/auth/refresh', { refresh_token }),

  me: () =>
    api.get<ApiResponse<User>>('/api/v1/cms/auth/me', { auth: true, cms: true }),
}
