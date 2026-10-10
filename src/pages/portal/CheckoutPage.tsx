import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/lib/context/CartContext'
import { useAuth } from '@/lib/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { orders, type CheckoutPayload } from '@/lib/api/orders'
import type { PaymentMethod } from '@/lib/types'

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    full_name: user?.name ?? '',
    phone: user?.phone ?? '',
    address_line1: '',
    address_line2: '',
    city: 'Dhaka',
    state: 'Dhaka',
    postal_code: '',
    country: 'Bangladesh',
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('delivery_advance_cod')
  const [advanceMethod, setAdvanceMethod] = useState('bkash')
  const [advanceTrxId, setAdvanceTrxId] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-500 mb-4">Please sign in to checkout.</p>
      <Link to="/login" className="text-brand hover:underline">Sign in</Link>
    </div>
  )

  const cartItems = cart?.items ?? []
  if (cartItems.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-500 mb-4">Your cart is empty.</p>
      <Link to="/products" className="text-brand hover:underline">Browse products</Link>
    </div>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload: CheckoutPayload = {
        shipping_address: form,
        payment_method: paymentMethod,
        notes: notes || undefined,
        delivery_fee: 150,
      }
      if (paymentMethod === 'delivery_advance_cod') {
        payload.delivery_advance_amount = 150
        payload.advance_payment_method = advanceMethod
        if (advanceTrxId) payload.advance_transaction_id = advanceTrxId
      }
      const res = await orders.checkout(payload)
      if (res.data) {
        await clearCart()
        navigate(`/orders/${res.data.id}?success=1`)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  const field = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-black">Full Name *</label>
                  <input required value={form.full_name} onChange={field('full_name')} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-brand" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-black">Phone *</label>
                  <input required value={form.phone} onChange={field('phone')} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-brand" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-black">Address Line 1 *</label>
                  <input required value={form.address_line1} onChange={field('address_line1')} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-brand" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-black">Address Line 2</label>
                  <input value={form.address_line2} onChange={field('address_line2')} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-brand" />
                </div>
                <div>
                  <label className="text-sm font-medium text-black">City *</label>
                  <input required value={form.city} onChange={field('city')} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-brand" />
                </div>
                <div>
                  <label className="text-sm font-medium text-black">Postal Code</label>
                  <input value={form.postal_code} onChange={field('postal_code')} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-brand" />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="payment" value="delivery_advance_cod" checked readOnly className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Advance + COD</p>
                    <p className="text-xs text-gray-500">Send ৳150 advance via bKash/Nagad, rest on delivery</p>
                  </div>
                </label>
              </div>

              {paymentMethod === 'delivery_advance_cod' && (
                <div className="mt-4 space-y-3 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Advance Payment Details (৳150)</p>
                  <div>
                    <label className="text-sm font-medium text-black">Payment Method</label>
                    <select value={advanceMethod} onChange={e => setAdvanceMethod(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black">
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="rocket">Rocket</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-black">Transaction ID (optional — can submit later)</label>
                    <input value={advanceTrxId} onChange={e => setAdvanceTrxId(e.target.value)} placeholder="e.g. TRX123456789" className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" />
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <label className="text-sm font-medium text-gray-900 block mb-2">Order Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-brand" placeholder="Any instructions for delivery..." />
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-20">
              <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm mb-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-gray-600">
                    <span className="truncate pr-2">{item.product?.title ?? 'Product'} ×{item.quantity}</span>
                    <span>৳{item.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>৳{(cart?.total_amount ?? 0).toLocaleString()}</span></div>
                <div className="flex justify-between text-gray-600"><span>Delivery fee</span><span>৳150</span></div>
                {paymentMethod === 'delivery_advance_cod' && (
                  <div className="flex justify-between text-blue-700 font-medium"><span>Advance now</span><span>৳150</span></div>
                )}
                <div className="flex justify-between font-bold text-gray-900 border-t pt-2">
                  <span>Total</span>
                  <span>৳{((cart?.total_amount ?? 0) + 150).toLocaleString()}</span>
                </div>
              </div>

              {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

              <Button type="submit" size="lg" className="w-full mt-6" loading={loading}>
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
