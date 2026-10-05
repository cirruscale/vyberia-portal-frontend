import { api } from './client'
import type { ApiResponse, Order, PaginatedResponse, ShippingAddress, PaymentMethod } from '../types'

export interface CheckoutPayload {
  items?: { product_id: string; quantity: number }[]
  shipping_address: ShippingAddress
  payment_method: PaymentMethod
  delivery_fee?: number
  delivery_advance_amount?: number
  advance_payment_method?: string
  advance_transaction_id?: string
  notes?: string
}

export interface GuestCheckoutPayload {
  items: { product_id: string; quantity: number }[]
  shipping_address: ShippingAddress
  payment_method: PaymentMethod
  delivery_fee?: number
  delivery_advance_amount?: number
  advance_payment_method?: string
  advance_transaction_id?: string
  notes?: string
}

// Portal
export const orders = {
  checkout: (data: CheckoutPayload) =>
    api.post<ApiResponse<Order>>('/api/v1/orders/checkout', data, { auth: true }),

  guestCheckout: (data: GuestCheckoutPayload) =>
    api.post<ApiResponse<Order>>('/api/v1/orders/guest-checkout', data),

  submitAdvance: (id: string, data: { advance_payment_method: string; advance_transaction_id: string; notes?: string }) =>
    api.post<ApiResponse<Order>>(`/api/v1/orders/${id}/advance-payment`, data, { auth: true }),

  myOrders: (page = 1, page_size = 10) =>
    api.get<PaginatedResponse<Order>>('/api/v1/orders/my', { auth: true, params: { page, page_size } }),

  get: (id: string) =>
    api.get<ApiResponse<Order>>(`/api/v1/orders/${id}`, { auth: true }),

  cancel: (id: string) =>
    api.post<ApiResponse<Order>>(`/api/v1/orders/${id}/cancel`, {}, { auth: true }),
}

// CMS
export interface CmsOrderFilters {
  status?: string
  payment_method?: string
  advance_status?: string
  search?: string
  page?: number
  page_size?: number
}

export const cmsOrders = {
  list: (filters?: CmsOrderFilters) =>
    api.get<PaginatedResponse<Order>>('/api/v1/cms/orders', {
      auth: true, cms: true,
      params: filters as Record<string, string | number | boolean | undefined>,
    }),

  get: (id: string) =>
    api.get<ApiResponse<Order>>(`/api/v1/cms/orders/${id}`, { auth: true, cms: true }),

  updateStatus: (id: string, status: string, notes?: string) =>
    api.patch<ApiResponse<Order>>(`/api/v1/cms/orders/${id}/status`, { status, notes }, { auth: true, cms: true }),

  verifyAdvance: (id: string, status: 'verified' | 'rejected', notes?: string) =>
    api.patch<ApiResponse<Order>>(`/api/v1/cms/orders/${id}/verify-advance`, { status, notes }, { auth: true, cms: true }),
}
