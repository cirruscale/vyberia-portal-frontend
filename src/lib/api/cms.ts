import { api } from './client'
import type { ApiResponse, DashboardStats, PaginatedResponse, User } from '../types'

// Dashboard
export const cmsDashboard = {
  get: () =>
    api.get<ApiResponse<DashboardStats>>('/api/v1/cms/dashboard', { auth: true, cms: true }),
}

// Users
export interface CmsUserFilters {
  search?: string
  role?: string
  is_active?: boolean
  page?: number
  page_size?: number
}

export const cmsUsers = {
  list: (filters?: CmsUserFilters) =>
    api.get<PaginatedResponse<User>>('/api/v1/cms/users', {
      auth: true, cms: true,
      params: filters as Record<string, string | number | boolean | undefined>,
    }),

  get: (id: string) =>
    api.get<ApiResponse<User>>(`/api/v1/cms/users/${id}`, { auth: true, cms: true }),

  create: (data: { name: string; email: string; phone?: string; password: string; role: string; is_active?: boolean }) =>
    api.post<ApiResponse<User>>('/api/v1/cms/users', data, { auth: true, cms: true }),

  update: (id: string, data: Partial<{ name: string; email: string; phone: string; role: string; is_active: boolean; password: string }>) =>
    api.put<ApiResponse<User>>(`/api/v1/cms/users/${id}`, data, { auth: true, cms: true }),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/api/v1/cms/users/${id}`, { auth: true, cms: true }),
}
