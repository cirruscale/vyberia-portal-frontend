import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '@/lib/types'
import { useCart } from '@/lib/context/CartContext'
import GuestCheckoutModal from '@/components/product/GuestCheckoutModal'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function productImageUrl(url?: string): string {
  if (!url) return 'https://placehold.co/400x500/f5f5f5/ccc?text=+'
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
        className="group animate-card-enter"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        {/* Image */}
        <Link to={`/products/${product.slug}`} className="block relative aspect-[3/4] bg-[#f5f5f5] rounded-[4px] overflow-hidden mb-3.5 img-hover">
          <img
            src={productImageUrl(product.image_url)}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Badges */}
          {product.is_trending && (
            <div className="absolute top-3 left-3">
              <span className="bg-dark text-white text-[10px] font-medium px-2.5 py-1 rounded-sm uppercase tracking-[0.06em]">
                Trending
              </span>
            </div>
          )}
          {outOfStock && (
            <div className="absolute top-3 left-3">
              <span className="bg-white/90 text-dark text-[10px] font-medium px-2.5 py-1 rounded-sm uppercase tracking-[0.06em]">
                Sold Out
              </span>
            </div>
          )}

          {/* Quick actions on hover */}
          {!outOfStock && (
            <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={added}
                  className="flex-1 bg-dark text-white text-[11px] font-medium py-2.5 rounded-[3px] hover:bg-brand transition-colors cursor-pointer uppercase tracking-[0.05em]"
                >
                  {added ? 'Added' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="bg-white text-dark text-[11px] font-medium px-4 py-2.5 rounded-[3px] hover:bg-[#f5f5f5] transition-colors cursor-pointer uppercase tracking-[0.05em]"
                >
                  Buy
                </button>
              </div>
            </div>
          )}
        </Link>

        {/* Info */}
        <Link to={`/products/${product.slug}`} className="block">
          {product.category?.name && (
            <p className="text-[10px] text-muted uppercase tracking-[0.08em] mb-1">
              {product.category.name}
            </p>
          )}
          <h3 className="text-[13px] font-medium text-dark leading-tight line-clamp-1 mb-1">
            {product.title}
          </h3>
          <p className="text-[13px] text-[#555]">
            ৳{product.price.toLocaleString()}
          </p>
        </Link>
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
