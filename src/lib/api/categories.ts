import { api } from './client'
import type { ApiResponse, Category } from '../types'

// Portal
export const categories = {
  list: (tree = false) =>
    api.get<ApiResponse<Category[]>>('/api/v1/categories', { params: { tree } }),

  tree: () =>
    api.get<ApiResponse<Category[]>>('/api/v1/categories/tree'),

  get: (identifier: string) =>
    api.get<ApiResponse<Category>>(`/api/v1/categories/${identifier}`),

  subcategories: (identifier: string) =>
    api.get<ApiResponse<Category[]>>(`/api/v1/categories/${identifier}/subcategories`),

  allSubcategories: () =>
    api.get<ApiResponse<Category[]>>('/api/v1/subcategories'),
}

// CMS
export const cmsCategories = {
  list: (tree = false) =>
    api.get<ApiResponse<Category[]>>('/api/v1/cms/categories', {
      auth: true, cms: true, params: { tree },
    }),

  create: (data: { name: string; slug: string; description?: string; image_url?: string }) =>
    api.post<ApiResponse<Category>>('/api/v1/cms/categories', data, { auth: true, cms: true }),

  update: (id: string, data: Partial<Category>) =>
    api.put<ApiResponse<Category>>(`/api/v1/cms/categories/${id}`, data, { auth: true, cms: true }),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/api/v1/cms/categories/${id}`, { auth: true, cms: true }),

  listSubcategories: () =>
    api.get<ApiResponse<Category[]>>('/api/v1/cms/subcategories', { auth: true, cms: true }),

  createSubcategory: (data: { name: string; parent_id: string; description?: string; image_url?: string }) =>
    api.post<ApiResponse<Category>>('/api/v1/cms/subcategories', data, { auth: true, cms: true }),

  getSubcategoriesOf: (id: string) =>
    api.get<ApiResponse<Category[]>>(`/api/v1/cms/categories/${id}/subcategories`, { auth: true, cms: true }),

  updateSubcategory: (id: string, data: Partial<Category>) =>
    api.put<ApiResponse<Category>>(`/api/v1/cms/subcategories/${id}`, data, { auth: true, cms: true }),

  deleteSubcategory: (id: string) =>
    api.delete<ApiResponse<void>>(`/api/v1/cms/subcategories/${id}`, { auth: true, cms: true }),
}
