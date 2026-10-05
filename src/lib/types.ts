// ─── User / Auth ────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'operator' | 'merchant' | 'customer'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar_url?: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

export interface AuthOutput {
  user: User
  tokens: TokenPair
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parent_id?: string
  image_url?: string
  subcategories?: Category[]
  created_at: string
  updated_at: string
}

// ─── Product ─────────────────────────────────────────────────────────────────

export type ProductStatus = 'active' | 'draft' | 'archived'

export interface Product {
  id: string
  sku: string
  title: string
  slug: string
  description: string
  price: number
  stock_quantity: number
  status: ProductStatus
  category_id?: string
  category?: Category
  subcategory_id?: string
  subcategory?: Category
  is_trending: boolean
  trending_priority: number
  image_url?: string
  images?: string[]
  created_at: string
  updated_at: string
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  product?: Product
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Cart {
  id: string
  user_id: string
  items: CartItem[]
  total_amount: number
  updated_at: string
}

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentMethod = 'cash_on_delivery' | 'delivery_advance_cod' | 'online'
export type AdvancePaymentStatus = 'not_required' | 'pending' | 'submitted' | 'verified' | 'rejected'

export interface ShippingAddress {
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_title: string
  sku: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  user?: User
  items: OrderItem[]
  subtotal_amount: number
  delivery_fee: number
  total_amount: number
  delivery_advance_amount: number
  due_amount: number
  payment_method: PaymentMethod
  advance_payment_method?: string
  advance_transaction_id?: string
  advance_payment_status: AdvancePaymentStatus
  advance_verified_at?: string
  advance_notes?: string
  status: OrderStatus
  payment_status: string
  shipping_address: ShippingAddress
  notes?: string
  created_at: string
  updated_at: string
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  financials: {
    total_revenue: number
    total_advance_collected: number
    total_due_amount: number
  }
  orders: {
    total: number
    pending: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
  }
  products: {
    total: number
    active: number
    low_stock: number
    trending: number
  }
  users: {
    total: number
    admin: number
    operator: number
    merchant: number
    customer: number
  }
  recent_orders: Order[]
  trending_products: Product[]
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface PaginatedResponse<T> {
  success: boolean
  data: PaginatedData<T>
  error?: string
}

// ─── Upload ──────────────────────────────────────────────────────────────────

export interface UploadResult {
  url: string
  key: string
  filename: string
  original_name: string
  size: number
  content_type: string
}
