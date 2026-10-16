import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/lib/context/CartContext'
import { useAuth } from '@/lib/context/AuthContext'
import { orders, type CheckoutPayload } from '@/lib/api/orders'
import type { PaymentMethod } from '@/lib/types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
function imgUrl(url?: string) {
  if (!url) return 'https://placehold.co/60x60/f5f5f5/ccc?text=+'
  return url.startsWith('http') ? url : `${BASE_URL}${url}`
}

const inputClass = 'mt-1.5 w-full border border-[#ddd] rounded-[3px] px-4 py-3 text-[14px] bg-white outline-none focus:border-dark transition-colors'

export default function CheckoutPage() {
  const { items, cartTotal, syncToServer, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    full_name: user?.name ?? '', phone: user?.phone ?? '',
    address_line1: '', address_line2: '', city: 'Dhaka', state: 'Dhaka', postal_code: '', country: 'Bangladesh',
  })
  const [paymentMethod] = useState<PaymentMethod>('delivery_advance_cod')
  const [advanceMethod, setAdvanceMethod] = useState('bkash')
  const [advanceTrxId, setAdvanceTrxId] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) return (
    <div className="max-w-[600px] mx-auto px-5 sm:px-8 py-24 text-center animate-fade-in">
      <p className="text-[22px] font-semibold tracking-[-0.02em] mb-2">Sign in to checkout</p>
      <p className="text-[14px] text-muted mb-8">You need an account to place an order from your cart.</p>
      <Link to="/login" className="inline-flex items-center gap-2 px-7 py-3 bg-dark text-white text-[13px] font-medium rounded-full hover:bg-brand transition-colors">Sign in</Link>
      <p className="mt-4 text-[12px] text-muted">Or use "Buy Now" on any product to order as guest.</p>
    </div>
  )

  if (items.length === 0) return (
    <div className="max-w-[600px] mx-auto px-5 sm:px-8 py-24 text-center animate-fade-in">
      <p className="text-muted mb-4">Your cart is empty.</p>
      <Link to="/products" className="text-[13px] text-dark underline underline-offset-4">Browse products</Link>
    </div>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await syncToServer()
      const payload: CheckoutPayload = {
        shipping_address: form, payment_method: paymentMethod, notes: notes || undefined, delivery_fee: 150,
      }
      if (paymentMethod === 'delivery_advance_cod') {
        payload.delivery_advance_amount = 150
        payload.advance_payment_method = advanceMethod
        if (advanceTrxId) payload.advance_transaction_id = advanceTrxId
      }
      const res = await orders.checkout(payload)
      if (res.data) { clearCart(); navigate(`/orders/${res.data.id}?success=1`) }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
    } finally { setLoading(false) }
  }

  const field = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className="max-w-[1000px] mx-auto px-5 sm:px-8 lg:px-12 py-8 animate-fade-in">
      <h1 className="text-[26px] font-semibold tracking-[-0.02em] mb-10">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping */}
            <section>
              <h2 className="text-[14px] font-semibold uppercase tracking-[0.06em] mb-5">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[13px] text-[#555]">Full Name *</label>
                  <input required value={form.full_name} onChange={field('full_name')} className={inputClass} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[13px] text-[#555]">Phone *</label>
                  <input required value={form.phone} onChange={field('phone')} className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className="text-[13px] text-[#555]">Address *</label>
                  <input required value={form.address_line1} onChange={field('address_line1')} placeholder="House, Road, Area" className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className="text-[13px] text-[#555]">Address Line 2</label>
                  <input value={form.address_line2} onChange={field('address_line2')} placeholder="Apartment, Floor (optional)" className={inputClass} />
                </div>
                <div>
                  <label className="text-[13px] text-[#555]">City *</label>
                  <input required value={form.city} onChange={field('city')} className={inputClass} />
                </div>
                <div>
                  <label className="text-[13px] text-[#555]">Postal Code</label>
                  <input value={form.postal_code} onChange={field('postal_code')} className={inputClass} />
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="pt-8 border-t border-[#eee]">
              <h2 className="text-[14px] font-semibold uppercase tracking-[0.06em] mb-5">Payment</h2>
              <label className="flex items-start gap-3 p-4 border border-dark rounded-[3px] cursor-pointer">
                <input type="radio" name="payment" checked readOnly className="mt-0.5 accent-dark" />
                <div>
                  <p className="text-[14px] font-medium">Advance + Cash on Delivery</p>
                  <p className="text-[12px] text-muted mt-0.5">Send ৳150 advance, pay the rest on delivery</p>
                </div>
              </label>
              <div className="mt-4 p-5 bg-[#fafafa] rounded-[3px] space-y-4">
                <p className="text-[13px] font-semibold">Advance Payment — ৳150</p>
                <div>
                  <label className="text-[13px] text-[#555]">Send via</label>
                  <select value={advanceMethod} onChange={e => setAdvanceMethod(e.target.value)} className={inputClass}>
                    <option value="bkash">bKash</option><option value="nagad">Nagad</option><option value="rocket">Rocket</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] text-[#555]">Transaction ID (optional)</label>
                  <input value={advanceTrxId} onChange={e => setAdvanceTrxId(e.target.value)} placeholder="TRX123456789" className={inputClass} />
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="pt-8 border-t border-[#eee]">
              <label className="text-[13px] text-[#555] block mb-2">Order Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="Delivery instructions..." />
            </section>
          </div>

          {/* Summary */}
          <div>
            <div className="sticky top-20 bg-[#fafafa] p-6 rounded-[4px]">
              <h2 className="text-[14px] font-semibold uppercase tracking-[0.06em] mb-5">Order Summary</h2>
              <div className="space-y-3 mb-5">
                {items.map(item => (
                  <div key={item.product_id} className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-[3px] overflow-hidden bg-[#eee] flex-shrink-0">
                      <img src={imgUrl(item.product.image_url)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-dark text-white text-[9px] font-medium rounded-full flex items-center justify-center">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] truncate">{item.product.title}</p>
                    </div>
                    <span className="text-[13px] font-medium flex-shrink-0">৳{(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#ddd] pt-4 space-y-2.5 text-[14px]">
                <div className="flex justify-between text-[#666]"><span>Subtotal</span><span>৳{cartTotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-[#666]"><span>Delivery</span><span>৳150</span></div>
                <div className="flex justify-between text-brand font-medium"><span>Advance</span><span>৳150</span></div>
                <div className="flex justify-between text-[16px] font-semibold border-t border-[#ddd] pt-3 mt-1"><span>Total</span><span>৳{(cartTotal + 150).toLocaleString()}</span></div>
              </div>
              {error && <p className="text-[13px] text-red-600 mt-4">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[50px] bg-dark text-white text-[13px] font-medium rounded-full hover:bg-brand transition-colors cursor-pointer uppercase tracking-[0.05em] mt-6 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
