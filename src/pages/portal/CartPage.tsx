import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/lib/context/CartContext'
import { useAuth } from '@/lib/context/AuthContext'
import { Button } from '@/components/ui/Button'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
function imgUrl(url?: string) {
  if (!url) return 'https://placehold.co/80x80/e2e8f0/94a3b8?text=?'
  return url.startsWith('http') ? url : `${BASE_URL}${url}`
}

export default function CartPage() {
  const { cart, updateItem, removeItem, loading } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  if (!user) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-500 mb-4">Sign in to view your cart.</p>
      <Link to="/login" className="text-brand hover:underline">Sign in</Link>
    </div>
  )

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12 text-center">Loading...</div>

  const items = cart?.items ?? []

  if (items.length === 0) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-500 mb-4">Your cart is empty.</p>
      <Link to="/products" className="text-brand hover:underline">Browse products</Link>
    </div>
  )

  const handleQty = async (productId: string, qty: number) => {
    if (qty < 1) return
    setUpdatingId(productId)
    try { await updateItem(productId, qty) } finally { setUpdatingId(null) }
  }

  const handleRemove = async (productId: string) => {
    setUpdatingId(productId)
    try { await removeItem(productId) } finally { setUpdatingId(null) }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="space-y-4 mb-8">
        {items.map(item => {
          const product = item.product
          const productImgUrl = imgUrl(product?.image_url)
          return (
            <div key={item.id} className="flex gap-4 bg-white rounded-lg border border-gray-200 p-4">
              <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                <img src={productImgUrl} alt={product?.title ?? ''} className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{product?.title ?? 'Product'}</p>
                <p className="text-sm text-gray-500">৳{item.unit_price.toLocaleString()} each</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border-2 border-gray-800 rounded text-sm bg-white">
                    <button className="px-2 py-1 text-black font-bold hover:bg-gray-100 disabled:opacity-40" disabled={updatingId === item.product_id} onClick={() => handleQty(item.product_id, item.quantity - 1)}>−</button>
                    <span className="w-8 text-center font-bold text-black border-x-2 border-gray-800">{item.quantity}</span>
                    <button className="px-2 py-1 text-black font-bold hover:bg-gray-100 disabled:opacity-40" disabled={updatingId === item.product_id} onClick={() => handleQty(item.product_id, item.quantity + 1)}>+</button>
                  </div>
                  <button onClick={() => handleRemove(item.product_id)} disabled={updatingId === item.product_id} className="text-sm text-red-500 hover:text-red-700">Remove</button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">৳{item.subtotal.toLocaleString()}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between text-lg font-bold mb-4">
          <span>Total</span>
          <span>৳{(cart?.total_amount ?? 0).toLocaleString()}</span>
        </div>
        <Button size="lg" className="w-full" onClick={() => navigate('/checkout')}>
          Proceed to Checkout
        </Button>
      </div>
    </div>
  )
}
