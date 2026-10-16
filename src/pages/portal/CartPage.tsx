import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/lib/context/CartContext'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
function imgUrl(url?: string) {
  if (!url) return 'https://placehold.co/80x80/f5f5f5/ccc?text=+'
  return url.startsWith('http') ? url : `${BASE_URL}${url}`
}

export default function CartPage() {
  const { items, cartTotal, updateItem, removeItem } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) return (
    <div className="max-w-[600px] mx-auto px-5 sm:px-8 py-24 text-center animate-fade-in">
      <p className="text-[22px] font-semibold tracking-[-0.02em] mb-2">Your cart is empty</p>
      <p className="text-[14px] text-muted mb-8">Add some products to get started.</p>
      <Link to="/products" className="inline-flex items-center gap-2 px-7 py-3 bg-dark text-white text-[13px] font-medium rounded-full hover:bg-brand transition-colors">
        Continue Shopping
      </Link>
    </div>
  )

  return (
    <div className="max-w-[1000px] mx-auto px-5 sm:px-8 lg:px-12 py-8 animate-fade-in">
      <h1 className="text-[26px] font-semibold tracking-[-0.02em] mb-1">Cart</h1>
      <p className="text-[13px] text-muted mb-10">{items.length} item{items.length > 1 ? 's' : ''}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[1fr_120px_100px] gap-4 pb-3 border-b border-[#eee] text-[11px] uppercase tracking-[0.08em] text-muted">
            <span>Product</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Total</span>
          </div>

          {items.map(item => (
            <div key={item.product_id} className="grid grid-cols-1 sm:grid-cols-[1fr_120px_100px] gap-4 items-center py-5 border-b border-[#eee]">
              <div className="flex gap-4 items-center">
                <Link to={`/products/${item.product.slug}`} className="relative w-[72px] h-[90px] flex-shrink-0 bg-[#f5f5f5] rounded-[3px] overflow-hidden img-hover">
                  <img src={imgUrl(item.product.image_url)} alt={item.product.title} className="absolute inset-0 w-full h-full object-cover" />
                </Link>
                <div className="min-w-0">
                  <Link to={`/products/${item.product.slug}`} className="text-[14px] font-medium block truncate hover:underline">{item.product.title}</Link>
                  <p className="text-[13px] text-muted mt-0.5">৳{item.product.price.toLocaleString()}</p>
                  <button onClick={() => removeItem(item.product_id)} className="text-[12px] text-muted hover:text-dark underline underline-offset-2 mt-1.5 cursor-pointer">Remove</button>
                </div>
              </div>
              <div className="flex items-center sm:justify-center">
                <div className="flex items-center border border-[#ddd] rounded-[3px]">
                  <button className="w-8 h-8 flex items-center justify-center text-[#999] hover:text-dark cursor-pointer" onClick={() => updateItem(item.product_id, item.quantity - 1)}>-</button>
                  <span className="w-8 text-center text-[13px] font-medium border-x border-[#ddd]">{item.quantity}</span>
                  <button className="w-8 h-8 flex items-center justify-center text-[#999] hover:text-dark cursor-pointer" onClick={() => updateItem(item.product_id, item.quantity + 1)}>+</button>
                </div>
              </div>
              <div className="text-[14px] font-medium sm:text-right">৳{(item.product.price * item.quantity).toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div>
          <div className="sticky top-20 bg-[#fafafa] p-6 rounded-[4px]">
            <h2 className="text-[14px] font-semibold uppercase tracking-[0.06em] mb-5">Summary</h2>
            <div className="space-y-3 text-[14px] mb-5">
              <div className="flex justify-between text-[#666]"><span>Subtotal</span><span className="font-medium text-dark">৳{cartTotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-[#666]"><span>Delivery</span><span className="text-[12px]">At checkout</span></div>
            </div>
            <div className="border-t border-[#ddd] pt-4 flex justify-between text-[16px] font-semibold mb-6">
              <span>Total</span><span>৳{cartTotal.toLocaleString()}</span>
            </div>
            <button onClick={() => navigate('/checkout')} className="w-full h-[50px] bg-dark text-white text-[13px] font-medium rounded-full hover:bg-brand transition-colors cursor-pointer uppercase tracking-[0.05em]">
              Checkout
            </button>
            <Link to="/products" className="block text-center text-[12px] text-muted hover:text-dark mt-4 transition-colors underline underline-offset-2">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
