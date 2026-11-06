import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/lib/context/CartContext'
import { useAuth } from '@/lib/context/AuthContext'
import { orders, type CheckoutPayload } from '@/lib/api/orders'
import type { PaymentMethod } from '@/lib/types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
function imgUrl(url?: string) {
  if (!url) return 'https://placehold.co/60x60/F2EDE5/C8BFB3?text=+'
  return url.startsWith('http') ? url : `${BASE_URL}${url}`
}

const inputClass = 'w-full border border-[#E0D8CE] bg-[#FAF9F7] px-4 py-3 text-[13px] text-[#1A2E24] outline-none focus:border-[#2D6A4F] transition-colors placeholder:text-[#C8BFB3]'
const labelClass = 'block text-[10px] tracking-[0.12em] uppercase text-[#7A7067] mb-2'

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
    <div className="max-w-[520px] mx-auto px-6 sm:px-8 py-28 text-center animate-fade-in">
      <p className="font-display text-[28px] font-light text-[#1A2E24] mb-3">Sign in to checkout</p>
      <p className="text-[13px] text-[#7A7067] mb-10 font-light">
        You need an account to place an order from your cart.
      </p>
      <Link to="/login" className="btn-primary">Sign in</Link>
      <p className="mt-6 text-[12px] text-[#2D6A4F]">Or use "Buy Now" on any product to order as guest.</p>
    </div>
  )

  if (items.length === 0) return (
    <div className="max-w-[520px] mx-auto px-6 sm:px-8 py-28 text-center animate-fade-in">
      <p className="font-display text-[26px] font-light text-[#7A7067] mb-4">Your cart is empty.</p>
      <Link to="/products" className="text-[12px] tracking-[0.08em] uppercase text-[#2D6A4F] hover:text-[#1B4332] underline underline-offset-4">Browse products</Link>
    </div>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
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
    <div className="max-w-[1100px] mx-auto px-6 sm:px-10 lg:px-16 py-12 animate-fade-in">
      <div className="mb-12">
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#2D6A4F] mb-3">Complete your order</p>
        <h1 className="font-display text-[36px] font-light text-[#1A2E24]">Checkout</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">
          <div className="lg:col-span-2 space-y-10">

            {/* Shipping */}
            <section>
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#2D6A4F] mb-6">Shipping address</p>
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 sm:col-span-1">
                  <label className={labelClass}>Full name *</label>
                  <input required value={form.full_name} onChange={field('full_name')} className={inputClass} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className={labelClass}>Phone *</label>
                  <input required value={form.phone} onChange={field('phone')} className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Address *</label>
                  <input required value={form.address_line1} onChange={field('address_line1')} placeholder="House, Road, Area" className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Address line 2 (optional)</label>
                  <input value={form.address_line2} onChange={field('address_line2')} placeholder="Apartment, Floor" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>City *</label>
                  <input required value={form.city} onChange={field('city')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Postal code</label>
                  <input value={form.postal_code} onChange={field('postal_code')} className={inputClass} />
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="pt-8 border-t border-[#E0D8CE]">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#2D6A4F] mb-6">Payment</p>
              <div className="border border-[#2D6A4F]/40 p-5 bg-[#FAF7F2] mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 border-2 border-[#2D6A4F] rounded-full mt-0.5 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-[#2D6A4F] rounded-full" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#1A2E24]">Advance + Cash on Delivery</p>
                    <p className="text-[12px] text-[#7A7067] mt-0.5 font-light">Send ৳150 advance, pay the rest on delivery</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#FAF9F7] border border-[#E0D8CE] p-5 space-y-5">
                <p className="text-[11px] tracking-[0.08em] uppercase text-[#2D6A4F]">Advance payment — ৳150</p>
                <div>
                  <label className={labelClass}>Send via</label>
                  <select value={advanceMethod} onChange={e => setAdvanceMethod(e.target.value)} className={inputClass}>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Transaction ID (optional)</label>
                  <input value={advanceTrxId} onChange={e => setAdvanceTrxId(e.target.value)} placeholder="TRX123456789" className={inputClass} />
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="pt-8 border-t border-[#E0D8CE]">
              <label className={labelClass}>Order notes (optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="w-full border border-[#E0D8CE] bg-[#FAF9F7] px-4 py-3 text-[13px] text-[#1A2E24] outline-none focus:border-[#2D6A4F] transition-colors resize-none placeholder:text-[#C8BFB3]"
                placeholder="Delivery instructions, preferred time..."
              />
            </section>
          </div>

          {/* Summary */}
          <div>
            <div className="sticky top-[112px] border border-[#E0D8CE] bg-[#FAF9F7] p-7">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#2D6A4F] mb-6">Order Summary</p>

              <div className="space-y-4 mb-6 pb-6 border-b border-[#E0D8CE]">
                {items.map(item => (
                  <div key={item.product_id} className="flex items-center gap-3">
                    <div className="relative w-11 h-14 bg-[#F2EDE5] flex-shrink-0 overflow-hidden">
                      <img src={imgUrl(item.product.image_url)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <span className="absolute -top-1 -right-1 w-[16px] h-[16px] bg-[#2D6A4F] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-[#1A2E24] truncate leading-snug">{item.product.title}</p>
                    </div>
                    <span className="text-[12px] font-medium text-[#1A2E24] flex-shrink-0">
                      ৳{(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-[13px] mb-6 pb-6 border-b border-[#E0D8CE]">
                <div className="flex justify-between text-[#7A7067]">
                  <span>Subtotal</span><span>৳{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#7A7067]">
                  <span>Delivery</span><span>৳150</span>
                </div>
                <div className="flex justify-between text-[#2D6A4F]">
                  <span>Advance due now</span><span>৳150</span>
                </div>
              </div>

              <div className="flex justify-between mb-7">
                <span className="text-[13px] font-medium text-[#1A2E24] uppercase tracking-[0.06em]">Total</span>
                <span className="font-display text-[22px] font-light text-[#1A2E24]">৳{(cartTotal + 150).toLocaleString()}</span>
              </div>

              {error && <p className="text-[12px] text-red-500 mb-4">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] bg-[#2D6A4F] text-[#FAF9F7] text-[11px] font-medium uppercase tracking-[0.12em] hover:bg-[#1B4332] transition-colors cursor-pointer disabled:opacity-40"
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
