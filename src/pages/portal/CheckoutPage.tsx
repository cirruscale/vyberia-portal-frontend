import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/lib/context/CartContext'
import { useAuth } from '@/lib/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { orders, type CheckoutPayload } from '@/lib/api/orders'
import type { PaymentMethod } from '@/lib/types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
function imgUrl(url?: string) {
  if (!url) return 'https://placehold.co/60x60/f5f5f4/a8a29e?text=?'
  return url.startsWith('http') ? url : `${BASE_URL}${url}`
}

const inputClass = 'mt-1 w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all'

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
    <div className="max-w-2xl mx-auto py-20 text-center animate-fade-in">
      <h2 className="text-lg font-bold mb-2">Sign in to checkout</h2>
      <p className="text-sm text-muted mb-4">You need an account to place an order from your cart.</p>
      <Link to="/login" className="text-sm font-medium text-brand hover:text-brand-hover">Sign in &rarr;</Link>
      <p className="mt-2 text-xs text-muted">Or use "Buy Now" on any product to order as guest.</p>
    </div>
  )

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto py-20 text-center animate-fade-in">
      <p className="text-muted mb-4">Your cart is empty.</p>
      <Link to="/products" className="text-sm font-medium text-brand">Browse products</Link>
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
    <div className="max-w-4xl mx-auto py-6 animate-fade-in">
      <h1 className="text-xl font-bold mb-6">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-semibold mb-4">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="text-sm font-medium text-stone-600">Full Name *</label><input required value={form.full_name} onChange={field('full_name')} className={inputClass} /></div>
                <div className="col-span-2 sm:col-span-1"><label className="text-sm font-medium text-stone-600">Phone *</label><input required value={form.phone} onChange={field('phone')} className={inputClass} /></div>
                <div className="col-span-2"><label className="text-sm font-medium text-stone-600">Address *</label><input required value={form.address_line1} onChange={field('address_line1')} className={inputClass} /></div>
                <div className="col-span-2"><label className="text-sm font-medium text-stone-600">Address Line 2</label><input value={form.address_line2} onChange={field('address_line2')} className={inputClass} /></div>
                <div><label className="text-sm font-medium text-stone-600">City *</label><input required value={form.city} onChange={field('city')} className={inputClass} /></div>
                <div><label className="text-sm font-medium text-stone-600">Postal Code</label><input value={form.postal_code} onChange={field('postal_code')} className={inputClass} /></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-semibold mb-4">Payment</h2>
              <label className="flex items-start gap-3 p-3 border border-brand/30 bg-brand-light/40 rounded-lg cursor-pointer">
                <input type="radio" name="payment" checked readOnly className="mt-0.5 accent-brand" />
                <div>
                  <p className="text-sm font-medium">Advance + Cash on Delivery</p>
                  <p className="text-xs text-muted">Send ৳150 advance, pay the rest on delivery</p>
                </div>
              </label>
              <div className="mt-3 p-4 bg-stone-50 rounded-lg space-y-3">
                <p className="text-sm font-semibold text-brand-dark">Advance (৳150)</p>
                <div>
                  <label className="text-sm font-medium text-stone-600">Send via</label>
                  <select value={advanceMethod} onChange={e => setAdvanceMethod(e.target.value)} className={inputClass}>
                    <option value="bkash">bKash</option><option value="nagad">Nagad</option><option value="rocket">Rocket</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600">Transaction ID (optional)</label>
                  <input value={advanceTrxId} onChange={e => setAdvanceTrxId(e.target.value)} placeholder="TRX123456789" className={inputClass} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">
              <label className="text-sm font-medium block mb-2">Order Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="Delivery instructions..." />
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-20">
              <h2 className="font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.product_id} className="flex items-center gap-2.5">
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                      <img src={imgUrl(item.product.image_url)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate">{item.product.title}</p>
                      <p className="text-[10px] text-muted">x{item.quantity}</p>
                    </div>
                    <span className="text-xs font-medium">৳{(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone-100 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted"><span>Subtotal</span><span>৳{cartTotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-muted"><span>Delivery</span><span>৳150</span></div>
                <div className="flex justify-between text-brand font-medium"><span>Advance</span><span>৳150</span></div>
                <div className="flex justify-between font-bold border-t border-stone-100 pt-2 mt-1"><span>Total</span><span>৳{(cartTotal + 150).toLocaleString()}</span></div>
              </div>
              {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
              <Button type="submit" size="lg" className="w-full mt-5" loading={loading}>Place Order</Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
