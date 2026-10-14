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

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
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
      <div
        className="bg-white rounded-lg overflow-hidden shadow-sm border border-stone-100 card-hover animate-card-enter"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        {/* Image */}
        <Link to={`/products/${product.slug}`} className="block relative aspect-square bg-stone-100 overflow-hidden">
          <img
            src={productImageUrl(product.image_url)}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {(product.is_trending || outOfStock) && (
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.is_trending && (
                <span className="bg-dark text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Trending
                </span>
              )}
              {outOfStock && (
                <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                  Sold Out
                </span>
              )}
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="p-3">
          <Link to={`/products/${product.slug}`} className="block">
            {product.category?.name && (
              <p className="text-[10px] font-medium text-muted uppercase tracking-wider mb-0.5">
                {product.category.name}
              </p>
            )}
            <h3 className="text-[13px] font-semibold text-stone-900 line-clamp-2 leading-snug mb-1">
              {product.title}
            </h3>
            <span className="text-base font-bold text-stone-900 block mb-2.5">
              ৳{product.price.toLocaleString()}
            </span>
          </Link>

          {/* Always visible buttons */}
          {outOfStock ? (
            <div className="text-center py-2 text-xs font-semibold text-stone-400 border border-stone-200 rounded-lg bg-stone-50">
              Out of Stock
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-white text-stone-900 text-xs font-semibold py-2 rounded-lg border border-stone-200 hover:border-stone-400 active:scale-[0.97] transition-all cursor-pointer"
              >
                {added ? <span className="animate-checkmark inline-block">✓ Added</span> : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                className="bg-white text-stone-900 text-xs font-semibold px-3.5 py-2 rounded-lg border border-stone-200 hover:border-stone-400 active:scale-[0.97] transition-all cursor-pointer"
              >
                Buy Now
              </button>
            </div>
          )}
        </div>
      </div>

      <GuestCheckoutModal
        product={product}
        initialQty={1}
        isOpen={buyNowOpen}
        onClose={() => setBuyNowOpen(false)}
      />
    </>
  )
}
