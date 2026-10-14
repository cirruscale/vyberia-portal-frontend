import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Product } from '../types'
import { cart as cartApi } from '../api/cart'

export interface LocalCartItem {
  product_id: string
  quantity: number
  product: Product
}

interface CartContextValue {
  items: LocalCartItem[]
  cartCount: number
  cartTotal: number
  addItem: (product: Product, quantity?: number) => void
  updateItem: (product_id: string, quantity: number) => void
  removeItem: (product_id: string) => void
  clearCart: () => void
  syncToServer: () => Promise<void>
}

const CART_KEY = 'vyberia_cart'

function loadCart(): LocalCartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveCart(items: LocalCartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<LocalCartItem[]>(loadCart)
  const [bounceKey, setBounceKey] = useState(0)

  useEffect(() => { saveCart(items) }, [items])

  // Expose bounceKey on window for header animation
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: bounceKey }))
  }, [bounceKey])

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const cartTotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.product_id === product.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity }
        return updated
      }
      return [...prev, { product_id: product.id, quantity, product }]
    })
    setBounceKey(k => k + 1)
  }, [])

  const updateItem = useCallback((product_id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.product_id !== product_id))
    } else {
      setItems(prev => prev.map(i => i.product_id === product_id ? { ...i, quantity } : i))
    }
  }, [])

  const removeItem = useCallback((product_id: string) => {
    setItems(prev => prev.filter(i => i.product_id !== product_id))
  }, [])

  const clearCart = useCallback(() => { setItems([]) }, [])

  const syncToServer = useCallback(async () => {
    try { await cartApi.clear() } catch { /* ok */ }
    for (const item of items) {
      await cartApi.addItem(item.product_id, item.quantity)
    }
  }, [items])

  return (
    <CartContext.Provider value={{ items, cartCount, cartTotal, addItem, updateItem, removeItem, clearCart, syncToServer }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
