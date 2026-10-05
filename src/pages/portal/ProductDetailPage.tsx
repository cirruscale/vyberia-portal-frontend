import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { products } from '@/lib/api/products'
import { useCart } from '@/lib/context/CartContext'
import { useAuth } from '@/lib/context/AuthContext'
import { Button } from '@/components/ui/Button'
import GuestCheckoutModal from '@/components/product/GuestCheckoutModal'
import type { Product } from '@/lib/types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function imageUrl(url?: string) {
  if (!url) return 'https://placehold.co/600x600/e2e8f0/94a3b8?text=No+Image'
  return url.startsWith('http') ? url : `${BASE_URL}${url}`
}

export default function ProductDetailPage() {
  const { identifier } = useParams<{ identifier: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [adding, setAdding] = useState(false)
  const [buyNowOpen, setBuyNowOpen] = useState(false)
  const { addItem } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!identifier) return
    products.get(identifier)
      .then(r => { if (r.data) setProduct(r.data) })
      .finally(() => setLoading(false))
  }, [identifier])

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return }
    if (!product) return
    setAdding(true)
    try { await addItem(product.id, quantity) } finally { setAdding(false) }
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="animate-pulse bg-gray-200 rounded-lg h-96" />
    </div>
  )

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">Product not found.</div>
  )

  const allImages = product.images?.length ? product.images : (product.image_url ? [product.image_url] : [])
  const outOfStock = product.stock_quantity === 0

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
              <img
                src={imageUrl(allImages[activeImg])}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 ${i === activeImg ? 'border-brand' : 'border-transparent'}`}
                  >
                    <img src={imageUrl(img)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="text-sm text-gray-500 mb-1">{product.category?.name}</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
            <div className="text-sm text-gray-500 mb-4">SKU: {product.sku}</div>
            <div className="text-4xl font-bold text-brand mb-6">৳{product.price.toLocaleString()}</div>
            <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

            <div className="mb-4">
              <span className={`text-sm font-medium ${!outOfStock ? 'text-green-600' : 'text-red-600'}`}>
                {!outOfStock ? `${product.stock_quantity} in stock` : 'Out of stock'}
              </span>
            </div>

            {!outOfStock && (
              <div className="flex items-center gap-4 mb-6">
                <label className="text-sm font-semibold text-black">Qty:</label>
                <div className="flex items-center border-2 border-gray-800 rounded-md bg-white">
                  <button className="px-3 py-2 text-black font-bold text-lg hover:bg-gray-100" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                  <span className="w-12 text-center text-sm font-bold text-black border-x-2 border-gray-800">{quantity}</span>
                  <button className="px-3 py-2 text-black font-bold text-lg hover:bg-gray-100" onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}>+</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {/* Buy Now — available to everyone */}
              <Button
                size="lg"
                onClick={() => setBuyNowOpen(true)}
                disabled={outOfStock}
                className="w-full"
              >
                {outOfStock ? 'Out of Stock' : 'Buy Now'}
              </Button>

              {/* Add to Cart — logged-in users only */}
              {user ? (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleAddToCart}
                  loading={adding}
                  disabled={outOfStock}
                  className="w-full"
                >
                  Add to Cart
                </Button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Sign in to add to cart
                </button>
              )}
            </div>

            {!user && !outOfStock && (
              <p className="mt-3 text-xs text-center text-gray-400">
                No account needed — just fill in your details to order
              </p>
            )}
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
