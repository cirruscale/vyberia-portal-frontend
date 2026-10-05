import { api } from './client'
import type { ApiResponse, Cart } from '../types'

export const cart = {
  get: () =>
    api.get<ApiResponse<Cart>>('/api/v1/cart', { auth: true }),

  addItem: (product_id: string, quantity: number) =>
    api.post<ApiResponse<Cart>>('/api/v1/cart/items', { product_id, quantity }, { auth: true }),

  updateItem: (product_id: string, quantity: number) =>
    api.put<ApiResponse<Cart>>(`/api/v1/cart/items/${product_id}`, { quantity }, { auth: true }),

  removeItem: (product_id: string) =>
    api.delete<ApiResponse<Cart>>(`/api/v1/cart/items/${product_id}`, { auth: true }),

  clear: () =>
    api.delete<ApiResponse<void>>('/api/v1/cart', { auth: true }),
}
