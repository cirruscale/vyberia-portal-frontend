import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import type { Cart } from '../types'
import { cart as cartApi } from '../api/cart'
import { useAuth } from './AuthContext'

interface CartContextType {
  cart: Cart | null
  cartCount: number
  loading: boolean
  addItem: (product_id: string, quantity: number) => Promise<void>
  updateItem: (product_id: string, quantity: number) => Promise<void>
  removeItem: (product_id: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)

  const refreshCart = useCallback(async () => {
    if (!user) { setCart(null); return }
    setLoading(true)
    try {
      const res = await cartApi.get()
      if (res.data) setCart(res.data)
    } catch {
      setCart(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { refreshCart() }, [refreshCart])

  const addItem = async (product_id: string, quantity: number) => {
    const res = await cartApi.addItem(product_id, quantity)
    if (res.data) setCart(res.data)
  }

  const updateItem = async (product_id: string, quantity: number) => {
    const res = await cartApi.updateItem(product_id, quantity)
    if (res.data) setCart(res.data)
  }

  const removeItem = async (product_id: string) => {
    const res = await cartApi.removeItem(product_id)
    if (res.data) setCart(res.data)
  }

  const clearCart = async () => {
    await cartApi.clear()
    setCart(null)
  }

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <CartContext.Provider value={{ cart, cartCount, loading, addItem, updateItem, removeItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
