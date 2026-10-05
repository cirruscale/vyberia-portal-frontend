import { api } from './client'
import type { ApiResponse, PaginatedResponse, Product } from '../types'

export interface ProductFilters {
  name?: string
  category_id?: string
  subcategory_id?: string
  search?: string
  min_price?: number
  max_price?: number
  sort_by?: 'newest' | 'price_asc' | 'price_desc' | 'trending'
  page?: number
  page_size?: number
}

// Portal
export const products = {
  list: (filters?: ProductFilters) =>
    api.get<PaginatedResponse<Product>>('/api/v1/products', { params: filters as Record<string, string | number | boolean | undefined> }),

  get: (identifier: string) =>
    api.get<ApiResponse<Product>>(`/api/v1/products/${identifier}`),

  trending: (limit = 10) =>
    api.get<ApiResponse<Product[]>>('/api/v1/trending', { params: { limit } }),
}

// CMS
export interface CmsProductFilters extends ProductFilters {
  status?: 'active' | 'draft' | 'archived'
  is_trending?: boolean
}

export const cmsProducts = {
  list: (filters?: CmsProductFilters) =>
    api.get<PaginatedResponse<Product>>('/api/v1/cms/products', {
      auth: true, cms: true,
      params: filters as Record<string, string | number | boolean | undefined>,
    }),

  get: (id: string) =>
    api.get<ApiResponse<Product>>(`/api/v1/cms/products/${id}`, { auth: true, cms: true }),

  create: (data: Partial<Product>) =>
    api.post<ApiResponse<Product>>('/api/v1/cms/products', data, { auth: true, cms: true }),

  update: (id: string, data: Partial<Product>) =>
    api.put<ApiResponse<Product>>(`/api/v1/cms/products/${id}`, data, { auth: true, cms: true }),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/api/v1/cms/products/${id}`, { auth: true, cms: true }),

  updateStock: (id: string, stock_quantity: number) =>
    api.patch<ApiResponse<Product>>(`/api/v1/cms/products/${id}/stock`, { stock_quantity }, { auth: true, cms: true }),

  addImage: (id: string, image_url: string) =>
    api.post<ApiResponse<Product>>(`/api/v1/cms/products/${id}/images`, { image_url }, { auth: true, cms: true }),

  removeImage: (id: string, image_url: string) =>
    api.delete<ApiResponse<Product>>(`/api/v1/cms/products/${id}/images?image_url=${encodeURIComponent(image_url)}`, { auth: true, cms: true }),

  // Trending
  listTrending: (limit = 20) =>
    api.get<ApiResponse<Product[]>>('/api/v1/cms/trending', { auth: true, cms: true, params: { limit } }),

  markTrending: (id: string, priority: number) =>
    api.post<ApiResponse<Product>>(`/api/v1/cms/trending/${id}`, { priority }, { auth: true, cms: true }),

  unmarkTrending: (id: string) =>
    api.delete<ApiResponse<void>>(`/api/v1/cms/trending/${id}`, { auth: true, cms: true }),
}
