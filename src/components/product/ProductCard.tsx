import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '@/lib/types'
import { useCart } from '@/lib/context/CartContext'
import GuestCheckoutModal from '@/components/product/GuestCheckoutModal'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function productImageUrl(url?: string): string {
  if (!url) return 'https://placehold.co/400x400/f5f5f4/a8a29e?text=No+Image'
  if (url.startsWith('http')) return url
  return `${BASE_URL}${url}`
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const [buyNowOpen, setBuyNowOpen] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setBuyNowOpen(true)
  }

  const outOfStock = product.stock_quantity === 0

  return (
    <>
      <Link
        to={`/products/${product.slug}`}
        className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="relative aspect-square bg-stone-100 overflow-hidden">
          <img
            src={productImageUrl(product.image_url)}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {(product.is_trending || outOfStock) && (
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.is_trending && (
                <span className="bg-dark text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Trending
                </span>
              )}
              {outOfStock && (
                <span className="bg-white/90 text-stone-600 text-[9px] font-bold px-2 py-0.5 rounded">
                  Sold Out
                </span>
              )}
            </div>
          )}

          {!outOfStock && (
            <div className="absolute inset-x-0 bottom-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <div className="flex gap-1.5">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-dark text-white text-[11px] font-semibold py-2 rounded-lg hover:bg-brand transition-colors duration-200 cursor-pointer"
                >
                  {added ? 'Added!' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="bg-white text-dark text-[11px] font-semibold px-3 py-2 rounded-lg hover:bg-brand hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  Buy
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-3">
          {product.category?.name && (
            <p className="text-[10px] font-medium text-muted uppercase tracking-wider mb-0.5">
              {product.category.name}
            </p>
          )}
          <h3 className="text-[13px] font-medium text-stone-900 line-clamp-2 leading-snug mb-1.5">
            {product.title}
          </h3>
          <span className="text-sm font-bold text-stone-900">
            ৳{product.price.toLocaleString()}
          </span>
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
