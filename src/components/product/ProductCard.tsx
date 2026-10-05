import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Product } from '@/lib/types'
import { useCart } from '@/lib/context/CartContext'
import { useAuth } from '@/lib/context/AuthContext'
import GuestCheckoutModal from '@/components/product/GuestCheckoutModal'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function productImageUrl(url?: string): string {
  if (!url) return 'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image'
  if (url.startsWith('http')) return url
  return `${BASE_URL}${url}`
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [buyNowOpen, setBuyNowOpen] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    setAdding(true)
    try {
      await addItem(product.id, 1)
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(false)
    }
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    setBuyNowOpen(true)
  }

  const outOfStock = product.stock_quantity === 0

  return (
    <>
      <Link to={`/products/${product.slug}`} className="group block rounded-lg border border-blue-200 overflow-hidden hover:shadow-lg transition-shadow" style={{ background: 'rgba(255,255,255,0.88)' }}>
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img
            src={productImageUrl(product.image_url)}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.is_trending && (
            <span className="absolute top-2 left-2 text-white text-xs px-2 py-0.5 rounded-full" style={{ background: '#C4A87A' }}>
              Trending
            </span>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-1">{product.category?.name}</p>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">{product.title}</h3>
          <span className="text-lg font-bold text-gray-900 block mb-3">৳{product.price.toLocaleString()}</span>
          <div className="flex gap-2">
            <button
              onClick={handleBuyNow}
              disabled={outOfStock}
              className="flex-1 text-xs text-white px-3 py-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              style={{ background: '#C4A87A' }}
            >
              {outOfStock ? 'Out of stock' : 'Buy Now'}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={adding || outOfStock}
              className="flex-1 text-xs px-3 py-1.5 rounded border-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              style={{ borderColor: '#C4A87A', color: '#C4A87A' }}
            >
              {adding ? '...' : 'Add to cart'}
            </button>
          </div>
        </div>
      </Link>

      <GuestCheckoutModal
        product={product}
        initialQty={1}
        isOpen={buyNowOpen}
        onClose={() => setBuyNowOpen(false)}
      />
    </>
  )
}
