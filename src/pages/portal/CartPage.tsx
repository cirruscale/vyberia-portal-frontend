import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/lib/context/CartContext'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
function imgUrl(url?: string) {
  if (!url) return 'https://placehold.co/80x100/F2EDE5/C8BFB3?text=+'
  return url.startsWith('http') ? url : `${BASE_URL}${url}`
}

export default function CartPage() {
  const { items, cartTotal, updateItem, removeItem } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) return (
    <div className="max-w-[520px] mx-auto px-6 sm:px-8 py-28 text-center animate-fade-in">
      <div className="w-16 h-16 border border-[#E0D8CE] flex items-center justify-center mx-auto mb-8">
        <svg className="w-6 h-6 text-[#C8BFB3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
        </svg>
      </div>
      <p className="font-display text-[26px] font-light text-[#0C0B0A] mb-3">Your cart is empty</p>
      <p className="text-[13px] text-[#7A7067] mb-10 font-light">Discover our curated collection and add something you love.</p>
      <Link to="/products" className="btn-primary">
        Continue Shopping
      </Link>
    </div>
  )

  return (
    <div className="max-w-[1100px] mx-auto px-6 sm:px-10 lg:px-16 py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-12">
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#065084] mb-3">Review</p>
        <h1 className="font-display text-[38px] font-light tracking-[-0.01em] text-[#0C0B0A]">Your Cart</h1>
        <p className="text-[13px] text-[#7A7067] mt-2 font-light">{items.length} item{items.length > 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">
        {/* Items */}
        <div className="lg:col-span-2">
          {/* Column labels */}
          <div className="hidden sm:grid grid-cols-[1fr_120px_100px] gap-4 pb-4 border-b border-[#E0D8CE]">
            <span className="text-[9px] tracking-[0.15em] uppercase text-[#065084]">Product</span>
            <span className="text-[9px] tracking-[0.15em] uppercase text-[#065084] text-center">Qty</span>
            <span className="text-[9px] tracking-[0.15em] uppercase text-[#065084] text-right">Total</span>
          </div>

          {items.map((item, i) => (
            <div
              key={item.product_id}
              className="grid grid-cols-1 sm:grid-cols-[1fr_120px_100px] gap-5 items-center py-7 border-b border-[#E0D8CE]"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex gap-5 items-center">
                <Link
                  to={`/products/${item.product.slug}`}
                  className="relative w-[72px] h-[90px] flex-shrink-0 bg-[#F2EDE5] overflow-hidden img-hover"
                >
                  <img
                    src={imgUrl(item.product.image_url)}
                    alt={item.product.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </Link>
                <div className="min-w-0">
                  <Link
                    to={`/products/${item.product.slug}`}
                    className="text-[13px] font-medium text-[#0C0B0A] block truncate hover:text-[#065084] transition-colors"
                  >
                    {item.product.title}
                  </Link>
                  {item.product.category?.name && (
                    <p className="text-[9px] tracking-[0.1em] uppercase text-[#065084] mt-1">
                      {item.product.category.name}
                    </p>
                  )}
                  <p className="text-[12px] text-[#7A7067] mt-1.5">৳{item.product.price.toLocaleString()}</p>
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-[10px] tracking-[0.06em] uppercase text-[#C8BFB3] hover:text-red-400 mt-2 cursor-pointer transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center sm:justify-center">
                <div className="flex items-center border border-[#E0D8CE]">
                  <button
                    className="w-8 h-8 flex items-center justify-center text-[#7A7067] hover:text-[#0C0B0A] hover:bg-[#F2EDE5] cursor-pointer transition-colors text-[13px]"
                    onClick={() => updateItem(item.product_id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="w-9 text-center text-[13px] font-medium border-x border-[#E0D8CE] py-1.5 text-[#0C0B0A]">
                    {item.quantity}
                  </span>
                  <button
                    className="w-8 h-8 flex items-center justify-center text-[#7A7067] hover:text-[#0C0B0A] hover:bg-[#F2EDE5] cursor-pointer transition-colors text-[13px]"
                    onClick={() => updateItem(item.product_id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Line total */}
              <div className="text-[13px] font-medium sm:text-right text-[#0C0B0A]">
                ৳{(item.product.price * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="sticky top-[112px] border border-[#E0D8CE] bg-[#FAF9F7] p-7">
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#065084] mb-6">Order Summary</p>

            <div className="space-y-4 mb-6 pb-6 border-b border-[#E0D8CE]">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#7A7067]">Subtotal</span>
                <span className="font-medium text-[#0C0B0A]">৳{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#7A7067]">Delivery</span>
                <span className="text-[11px] tracking-[0.04em] text-[#065084]">Calculated at checkout</span>
              </div>
            </div>

            <div className="flex justify-between mb-8">
              <span className="text-[13px] font-medium text-[#0C0B0A] uppercase tracking-[0.06em]">Total</span>
              <span className="font-display text-[22px] font-light text-[#0C0B0A]">৳{cartTotal.toLocaleString()}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full h-[52px] bg-[#065084] text-[#FAF9F7] text-[11px] font-medium uppercase tracking-[0.12em] hover:bg-[#1B4332] transition-colors cursor-pointer mb-4"
            >
              Proceed to Checkout
            </button>

            <Link
              to="/products"
              className="block text-center text-[11px] tracking-[0.08em] uppercase text-[#A0907E] hover:text-[#065084] transition-colors"
            >
              Continue Shopping
            </Link>

            {/* Trust note */}
            <div className="mt-8 pt-6 border-t border-[#E0D8CE]">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-[#065084] text-[10px]">◈</span>
                <span className="text-[11px] text-[#7A7067]">Secure checkout</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[#065084] text-[10px]">◇</span>
                <span className="text-[11px] text-[#7A7067]">bKash · Nagad · Rocket · COD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
