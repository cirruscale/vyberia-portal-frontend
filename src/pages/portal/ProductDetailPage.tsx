import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { products } from '@/lib/api/products'
import { useCart } from '@/lib/context/CartContext'
import GuestCheckoutModal from '@/components/product/GuestCheckoutModal'
import type { Product } from '@/lib/types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function imageUrl(url?: string) {
  if (!url) return 'https://placehold.co/700x700/F2EDE5/C8BFB3?text=+'
  return url.startsWith('http') ? url : `${BASE_URL}${url}`
}

export default function ProductDetailPage() {
  const { identifier } = useParams<{ identifier: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [added, setAdded] = useState(false)
  const [buyNowOpen, setBuyNowOpen] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    if (!identifier) return
    products.get(identifier)
      .then(r => { if (r.data) setProduct(r.data) })
      .finally(() => setLoading(false))
  }, [identifier])

  const handleAddToCart = () => {
    if (!product) return
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return (
    <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-14 animate-pulse">
      <div className="h-2.5 bg-[#E0D8CE] rounded w-40 mb-12" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24">
        <div className="aspect-square bg-[#F2EDE5]" />
        <div className="space-y-6 py-6">
          <div className="h-2.5 bg-[#E0D8CE] rounded w-1/5" />
          <div className="h-9 bg-[#E0D8CE] rounded w-3/4" />
          <div className="h-7 bg-[#E0D8CE] rounded w-1/3" />
          <div className="h-24 bg-[#E0D8CE] rounded" />
        </div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-24 text-center">
      <p className="font-display text-[22px] font-light text-[#7A7067] mb-5">Product not found</p>
      <Link to="/products" className="text-[11px] tracking-[0.1em] uppercase text-[#065084] hover:text-[#0C0B0A] transition-colors underline underline-offset-4">
        Back to Products
      </Link>
    </div>
  )

  const allImages = product.images?.length ? product.images : (product.image_url ? [product.image_url] : [])
  const outOfStock = product.stock_quantity === 0

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-10 animate-fade-in">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2.5 mb-12">
          <Link to="/" className="text-[11px] tracking-[0.06em] text-[#065084] hover:text-[#0C0B0A] transition-colors">Home</Link>
          <span className="text-[#C8BFB3] text-[10px]">/</span>
          <Link to="/products" className="text-[11px] tracking-[0.06em] text-[#7A7067] hover:text-[#0C0B0A] transition-colors">Products</Link>
          {product.category?.name && (
            <>
              <span className="text-[#C8BFB3] text-[10px]">/</span>
              <Link to={`/products?category_id=${product.category_id}`} className="text-[11px] tracking-[0.06em] text-[#7A7067] hover:text-[#0C0B0A] transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <span className="text-[#C8BFB3] text-[10px]">/</span>
          <span className="text-[11px] tracking-[0.06em] text-[#0C0B0A]">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

          {/* Images */}
          <div>
            <div className="relative aspect-square overflow-hidden bg-[#F2EDE5] mb-3 img-hover">
              <img
                src={imageUrl(allImages[activeImg])}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* corner accents */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-[#065084]/30 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-[#065084]/30 pointer-events-none" />
              {product.is_trending && (
                <div className="absolute top-4 right-4">
                  <span className="bg-[#065084] text-[#FAF9F7] text-[9px] font-medium px-3 py-1.5 uppercase tracking-[0.1em]">
                    Trending
                  </span>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative w-[76px] h-[76px] flex-shrink-0 overflow-hidden cursor-pointer transition-all duration-200 ${
                      i === activeImg
                        ? 'ring-1 ring-[#065084] ring-offset-1 ring-offset-[#FAF9F7]'
                        : 'opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img src={imageUrl(img)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="lg:py-6">
            {product.category?.name && (
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#065084] mb-4">
                {product.category.name}
              </p>
            )}
            <h1 className="font-display text-[32px] sm:text-[40px] font-light leading-[1.1] tracking-[-0.01em] text-[#0C0B0A] mb-3">
              {product.title}
            </h1>
            <p className="text-[10px] text-[#065084]/70 uppercase tracking-[0.1em] mb-8">
              SKU · {product.sku}
            </p>

            <div className="flex items-baseline gap-3 mb-8">
              <span className="font-display text-[32px] font-light tracking-[-0.01em] text-[#0C0B0A]">
                ৳{product.price.toLocaleString()}
              </span>
            </div>

            {product.description && (
              <p className="text-[13px] text-[#7A7067] leading-[1.8] mb-9 font-light border-l-2 border-[#065084]/30 pl-5">
                {product.description}
              </p>
            )}

            {/* Stock status */}
            <div className="flex items-center gap-2.5 mb-8 pb-8 border-b border-[#E0D8CE]">
              <span className={`w-1.5 h-1.5 rounded-full ${!outOfStock ? 'bg-[#6BAF7A]' : 'bg-red-400'}`} />
              <span className="text-[12px] tracking-[0.04em] text-[#7A7067]">
                {!outOfStock ? `${product.stock_quantity} in stock — ready to ship` : 'Currently out of stock'}
              </span>
            </div>

            {/* Quantity */}
            {!outOfStock && (
              <div className="flex items-center gap-6 mb-8">
                <span className="text-[11px] tracking-[0.1em] uppercase text-[#7A7067]">Quantity</span>
                <div className="flex items-center border border-[#E0D8CE]">
                  <button
                    className="w-10 h-10 flex items-center justify-center text-[#7A7067] hover:text-[#0C0B0A] hover:bg-[#F2EDE5] transition-colors cursor-pointer"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M20 12H4" /></svg>
                  </button>
                  <span className="w-12 text-center text-[13px] font-medium border-x border-[#E0D8CE] py-2.5 text-[#0C0B0A]">
                    {quantity}
                  </span>
                  <button
                    className="w-10 h-10 flex items-center justify-center text-[#7A7067] hover:text-[#0C0B0A] hover:bg-[#F2EDE5] transition-colors cursor-pointer"
                    onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-3 mb-5">
              <button
                onClick={handleAddToCart}
                disabled={outOfStock || added}
                className="flex-1 h-[52px] bg-[#065084] text-[#FAF9F7] text-[11px] font-medium uppercase tracking-[0.12em] hover:bg-[#1B4332] transition-colors disabled:opacity-40 cursor-pointer"
              >
                {added ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Added to Cart
                  </span>
                ) : outOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={() => setBuyNowOpen(true)}
                disabled={outOfStock}
                className="flex-1 h-[52px] border border-[#065084] text-[#065084] text-[11px] font-medium uppercase tracking-[0.12em] hover:bg-[#065084] hover:text-[#FAF9F7] transition-colors disabled:opacity-40 cursor-pointer"
              >
                Buy Now
              </button>
            </div>

            {!outOfStock && (
              <p className="text-[11px] text-center text-[#065084] tracking-[0.04em] mb-9">
                No account needed — Buy Now to order instantly as guest
              </p>
            )}

            {/* Trust points */}
            <div className="space-y-4 pt-7 border-t border-[#E0D8CE]">
              {[
                { label: 'Free shipping on orders over ৳5,000', icon: '◈' },
                { label: 'Secure payment via bKash, Nagad or COD', icon: '◇' },
                { label: 'Easy returns within 7 days', icon: '◈' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="text-[#065084] text-[11px] flex-shrink-0">{item.icon}</span>
                  <span className="text-[12px] text-[#7A7067] tracking-[0.02em]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {product && (
        <GuestCheckoutModal
          product={product}
          initialQty={quantity}
          isOpen={buyNowOpen}
          onClose={() => setBuyNowOpen(false)}
        />
      )}
    </>
  )
}
