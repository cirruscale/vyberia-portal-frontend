import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { products } from '@/lib/api/products'
import { useCart } from '@/lib/context/CartContext'
import GuestCheckoutModal from '@/components/product/GuestCheckoutModal'
import type { Product } from '@/lib/types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function imageUrl(url?: string) {
  if (!url) return 'https://placehold.co/600x600/f5f5f5/ccc?text=+'
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
    <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 py-12 animate-pulse">
      <div className="h-3 bg-[#eee] rounded w-48 mb-10" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <div className="aspect-square bg-[#f5f5f5] rounded-[4px]" />
        <div className="space-y-5 py-4">
          <div className="h-3 bg-[#eee] rounded w-1/4" />
          <div className="h-8 bg-[#eee] rounded w-3/4" />
          <div className="h-6 bg-[#eee] rounded w-1/3" />
          <div className="h-20 bg-[#eee] rounded" />
        </div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 py-20 text-center">
      <p className="text-muted mb-4">Product not found.</p>
      <Link to="/products" className="text-[13px] text-dark underline underline-offset-4 hover:no-underline">Back to products</Link>
    </div>
  )

  const allImages = product.images?.length ? product.images : (product.image_url ? [product.image_url] : [])
  const outOfStock = product.stock_quantity === 0

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 py-8 animate-fade-in">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12px] text-muted mb-8">
          <Link to="/" className="hover:text-dark transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-dark transition-colors">Products</Link>
          {product.category?.name && (
            <>
              <span>/</span>
              <Link to={`/products?category_id=${product.category_id}`} className="hover:text-dark transition-colors">{product.category.name}</Link>
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
          {/* Images */}
          <div>
            <div className="relative aspect-square rounded-[4px] overflow-hidden bg-[#f5f5f5] mb-3 img-hover">
              <img
                src={imageUrl(allImages[activeImg])}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`relative w-[72px] h-[72px] flex-shrink-0 rounded-[3px] overflow-hidden cursor-pointer transition-opacity ${
                      i === activeImg ? 'opacity-100 ring-1 ring-dark' : 'opacity-50 hover:opacity-80'
                    }`}>
                    <img src={imageUrl(img)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:py-4">
            {product.category?.name && (
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted mb-3">{product.category.name}</p>
            )}
            <h1 className="text-[28px] sm:text-[32px] font-semibold leading-[1.15] tracking-[-0.02em] mb-3">{product.title}</h1>
            <p className="text-[11px] text-muted uppercase tracking-[0.06em] mb-6">SKU {product.sku}</p>

            <div className="text-[26px] font-semibold tracking-[-0.02em] mb-6">৳{product.price.toLocaleString()}</div>

            {product.description && (
              <p className="text-[14px] text-[#666] leading-[1.7] mb-8">{product.description}</p>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2 mb-8 pb-8 border-b border-[#eee]">
              <span className={`w-2 h-2 rounded-full ${!outOfStock ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-[13px] text-[#666]">
                {!outOfStock ? `${product.stock_quantity} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Quantity */}
            {!outOfStock && (
              <div className="flex items-center gap-5 mb-6">
                <span className="text-[13px] text-[#666]">Quantity</span>
                <div className="flex items-center border border-[#ddd] rounded-[3px]">
                  <button className="w-10 h-10 flex items-center justify-center text-[#999] hover:text-dark transition-colors cursor-pointer" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M20 12H4" /></svg>
                  </button>
                  <span className="w-12 text-center text-[14px] font-medium border-x border-[#ddd] py-2.5">{quantity}</span>
                  <button className="w-10 h-10 flex items-center justify-center text-[#999] hover:text-dark transition-colors cursor-pointer" onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={handleAddToCart}
                disabled={outOfStock || added}
                className="flex-1 h-[50px] bg-dark text-white text-[13px] font-medium rounded-full hover:bg-brand transition-colors disabled:opacity-50 cursor-pointer uppercase tracking-[0.05em]"
              >
                {added ? 'Added to Cart' : outOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={() => setBuyNowOpen(true)}
                disabled={outOfStock}
                className="flex-1 h-[50px] border border-[#ddd] text-dark text-[13px] font-medium rounded-full hover:border-dark transition-colors disabled:opacity-50 cursor-pointer uppercase tracking-[0.05em]"
              >
                Buy Now
              </button>
            </div>

            {!outOfStock && (
              <p className="text-[11px] text-center text-muted mb-8">No account needed — use Buy Now to order as guest</p>
            )}

            {/* Details */}
            <div className="space-y-4 pt-6 border-t border-[#eee]">
              {[
                { label: 'Free shipping on orders over ৳5,000' },
                { label: 'Secure payment via bKash, Nagad or COD' },
                { label: 'Easy returns within 7 days' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-[#999] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-[13px] text-[#666]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {product && (
        <GuestCheckoutModal product={product} initialQty={quantity} isOpen={buyNowOpen} onClose={() => setBuyNowOpen(false)} />
      )}
    </>
  )
}
