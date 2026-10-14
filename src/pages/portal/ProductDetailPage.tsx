import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { products } from '@/lib/api/products'
import { useCart } from '@/lib/context/CartContext'
import { Button } from '@/components/ui/Button'
import GuestCheckoutModal from '@/components/product/GuestCheckoutModal'
import type { Product } from '@/lib/types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function imageUrl(url?: string) {
  if (!url) return 'https://placehold.co/600x600/f5f5f4/a8a29e?text=No+Image'
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
    <div className="max-w-5xl mx-auto py-12 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-square bg-stone-200 rounded-xl" />
        <div className="space-y-4 py-4">
          <div className="h-4 bg-stone-200 rounded w-1/4" />
          <div className="h-7 bg-stone-200 rounded w-3/4" />
          <div className="h-6 bg-stone-200 rounded w-1/3" />
          <div className="h-20 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  )

  if (!product) return <div className="max-w-5xl mx-auto py-12 text-center text-muted">Product not found.</div>

  const allImages = product.images?.length ? product.images : (product.image_url ? [product.image_url] : [])
  const outOfStock = product.stock_quantity === 0

  return (
    <>
      <div className="max-w-5xl mx-auto py-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 mb-3">
              <img src={imageUrl(allImages[activeImg])} alt={product.title} className="absolute inset-0 w-full h-full object-cover" />
              {product.is_trending && (
                <span className="absolute top-3 left-3 bg-dark text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">Trending</span>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all ${i === activeImg ? 'ring-2 ring-brand' : 'ring-1 ring-stone-200 hover:ring-stone-300'}`}>
                    <img src={imageUrl(img)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">{product.category?.name}</p>
            <h1 className="text-2xl font-bold mb-1">{product.title}</h1>
            <p className="text-xs text-muted mb-4">SKU: {product.sku}</p>
            <div className="text-2xl font-bold mb-5">৳{product.price.toLocaleString()}</div>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">{product.description}</p>

            <div className="mb-5">
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded ${!outOfStock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${!outOfStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {!outOfStock ? `${product.stock_quantity} in stock` : 'Out of stock'}
              </span>
            </div>

            {!outOfStock && (
              <div className="flex items-center gap-3 mb-6">
                <span className="text-sm text-stone-600">Qty:</span>
                <div className="flex items-center border border-stone-200 rounded-lg">
                  <button className="px-3 py-1.5 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                  <span className="w-10 text-center text-sm font-medium border-x border-stone-200">{quantity}</span>
                  <button className="px-3 py-1.5 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer" onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}>+</button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button size="lg" onClick={handleAddToCart} disabled={outOfStock || added} className="flex-1">
                {added ? 'Added to Cart!' : outOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button size="lg" variant="outline" onClick={() => setBuyNowOpen(true)} disabled={outOfStock} className="flex-1">
                Buy Now
              </Button>
            </div>

            {!outOfStock && (
              <p className="mt-3 text-xs text-center text-muted">No account needed — use Buy Now to order as guest</p>
            )}
          </div>
        </div>
      </div>

      {product && (
        <GuestCheckoutModal product={product} initialQty={quantity} isOpen={buyNowOpen} onClose={() => setBuyNowOpen(false)} />
      )}
    </>
  )
}
