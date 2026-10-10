import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { orders, type GuestCheckoutPayload } from '@/lib/api/orders'
import { useAuth } from '@/lib/context/AuthContext'
import type { Product, PaymentMethod } from '@/lib/types'

interface Props {
  product: Product
  initialQty: number
  isOpen: boolean
  onClose: () => void
}

type Step = 'form' | 'success'

const inputCls = 'mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-brand'
const labelCls = 'text-sm font-medium text-gray-800'

export default function GuestCheckoutModal({ product, initialQty, isOpen, onClose }: Props) {
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('form')
  const [orderNumber, setOrderNumber] = useState('')
  const [qty, setQty] = useState(initialQty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  if (!isOpen) return null

  const DELIVERY_FEE = 150
  const subtotal = product.price * qty
  const total = subtotal + DELIVERY_FEE

  const field = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload: GuestCheckoutPayload = {
        items: [{ product_id: product.id, quantity: qty }],
        shipping_address: form,
        payment_method: paymentMethod,
        delivery_fee: DELIVERY_FEE,
        notes: notes || undefined,
      }

      if (paymentMethod === 'delivery_advance_cod') {
        payload.delivery_advance_amount = DELIVERY_FEE
        payload.advance_payment_method = advanceMethod
        if (advanceTrxId) payload.advance_transaction_id = advanceTrxId
      }

      // Logged-in users use the authenticated endpoint so the order shows in "My Orders"
      let res
      if (user) {
        res = await orders.checkout({
          items: payload.items,
          shipping_address: payload.shipping_address,
          payment_method: payload.payment_method,
          delivery_fee: payload.delivery_fee,
          delivery_advance_amount: payload.delivery_advance_amount,
          advance_payment_method: payload.advance_payment_method,
          advance_transaction_id: payload.advance_transaction_id,
          notes: payload.notes,
        })
      } else {
        res = await orders.guestCheckout(payload)
      }

      if (res.data) {
        setOrderNumber(res.data.order_number)
        setStep('success')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('form')
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">
            {step === 'success' ? 'Order Confirmed!' : 'Quick Purchase'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {step === 'success' ? (
          /* ── Success Screen ── */
          <div className="px-6 py-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Order Placed!</h3>
            <p className="text-gray-500 mb-1">Your order number is:</p>
            <p className="text-2xl font-mono font-bold text-brand mb-4">{orderNumber}</p>
            <p className="text-sm text-gray-500 mb-6">
              We'll contact you on <strong>{form.phone}</strong> to confirm your delivery.
            </p>
            <Button onClick={handleClose} className="w-full">Continue Shopping</Button>
          </div>
        ) : (
          /* ── Purchase Form ── */
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* Product summary */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <img
                src={product.image_url?.startsWith('http') ? product.image_url : `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${product.image_url}`}
                alt={product.title}
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{product.title}</p>
                <p className="text-sm text-brand font-bold">৳{product.price.toLocaleString()} each</p>
              </div>
              {/* Qty */}
              <div className="flex items-center border-2 border-gray-300 rounded-lg bg-white">
                <button type="button" className="px-2 py-1 text-gray-700 font-bold" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className="w-8 text-center text-sm font-bold text-black">{qty}</span>
                <button type="button" className="px-2 py-1 text-gray-700 font-bold" onClick={() => setQty(q => Math.min(product.stock_quantity, q + 1))}>+</button>
              </div>
            </div>

            {/* Contact & Shipping */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Delivery Information</h3>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Full Name *</label>
                  <input required value={form.full_name} onChange={field('full_name')} placeholder="Your full name" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Phone Number *</label>
                  <input required value={form.phone} onChange={field('phone')} placeholder="01XXXXXXXXX" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Address *</label>
                  <input required value={form.address_line1} onChange={field('address_line1')} placeholder="House, Road, Area" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Apartment / Floor (optional)</label>
                  <input value={form.address_line2} onChange={field('address_line2')} placeholder="Flat 4B, 3rd Floor" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>City *</label>
                    <input required value={form.city} onChange={field('city')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Postal Code</label>
                    <input value={form.postal_code} onChange={field('postal_code')} placeholder="1000" className={inputCls} />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Method</h3>
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer border-brand bg-brand/5">
                  <input type="radio" name="payment_method" value="delivery_advance_cod" checked readOnly className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Advance + COD <span className="text-brand">(Recommended)</span></p>
                    <p className="text-xs text-gray-500">Send ৳150 advance via bKash/Nagad, rest on delivery</p>
                  </div>
                </label>
              </div>

              {paymentMethod === 'delivery_advance_cod' && (
                <div className="mt-3 p-4 bg-blue-50 rounded-xl space-y-3">
                  <p className="text-sm font-medium text-blue-900">Advance Payment — ৳{DELIVERY_FEE}</p>
                  <div>
                    <label className={labelCls}>Send via</label>
                    <select value={advanceMethod} onChange={e => setAdvanceMethod(e.target.value)}
                      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black">
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="rocket">Rocket</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Transaction ID (optional — can submit later)</label>
                    <input value={advanceTrxId} onChange={e => setAdvanceTrxId(e.target.value)}
                      placeholder="TRX123456789" className={inputCls} />
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className={labelCls}>Order Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                placeholder="Any special instructions..."
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>

            {/* Order summary strip */}
            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>{product.title} ×{qty}</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery fee</span>
                <span>৳{DELIVERY_FEE}</span>
              </div>
              {paymentMethod === 'delivery_advance_cod' && (
                <div className="flex justify-between text-blue-700 font-medium">
                  <span>Advance now</span>
                  <span>৳{DELIVERY_FEE}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 border-t pt-2 mt-2">
                <span>Total</span>
                <span>৳{total.toLocaleString()}</span>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Place Order
            </Button>

            {!user && (
              <p className="text-xs text-center text-gray-400">
                No account needed. We'll call you to confirm.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
