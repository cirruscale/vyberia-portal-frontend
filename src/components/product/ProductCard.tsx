import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '@/lib/types'
import { useCart } from '@/lib/context/CartContext'
import GuestCheckoutModal from '@/components/product/GuestCheckoutModal'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function productImageUrl(url?: string): string {
  if (!url) return 'https://placehold.co/480x600/F2EDE5/C8BFB3?text=+'
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
    setTimeout(() => setAdded(false), 1800)
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
        style={{ animationDelay: `${index * 55}ms` }}
      >
        {/* Image container */}
        <Link
          to={`/products/${product.slug}`}
          className="block relative aspect-[3/4] bg-[#F2EDE5] overflow-hidden mb-4 img-hover"
        >
          <img
            src={productImageUrl(product.image_url)}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0B0A]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_trending && !outOfStock && (
              <span className="bg-[#065084] text-[#FAF9F7] text-[9px] font-medium px-2.5 py-1 uppercase tracking-[0.1em]">
                Trending
              </span>
            )}
            {outOfStock && (
              <span className="bg-[#FAF9F7]/90 text-[#0C0B0A] text-[9px] font-medium px-2.5 py-1 uppercase tracking-[0.1em]">
                Sold Out
              </span>
            )}
          </div>

          {/* Quick actions */}
          {!outOfStock && (
            <div className="absolute inset-x-0 bottom-0 p-3.5 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={added}
                  className="flex-1 bg-[#065084] text-[#FAF9F7] text-[11px] font-semibold py-4 uppercase tracking-[0.1em] hover:bg-[#1B4332] transition-colors cursor-pointer"
                >
                  {added ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Added
                    </span>
                  ) : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-[#065084] text-[#FAF9F7] text-[11px] font-semibold py-4 uppercase tracking-[0.1em] hover:bg-[#1B4332] transition-colors cursor-pointer"
                >
                  Buy Now
                </button>
              </div>
            </div>
          )}
        </Link>

        {/* Product info */}
        <Link to={`/products/${product.slug}`} className="block">
          {product.category?.name && (
            <p className="text-[9px] tracking-[0.14em] uppercase text-[#065084] mb-1.5">
              {product.category.name}
            </p>
          )}
          <h3 className="text-[13px] font-normal text-[#0C0B0A] leading-snug line-clamp-1 mb-2 hover:text-[#065084] transition-colors">
            {product.title}
          </h3>
          <p className="text-[13px] font-medium text-[#0C0B0A] tracking-[-0.01em]">
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
