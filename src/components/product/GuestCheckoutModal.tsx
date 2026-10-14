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

const inputCls = 'mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all'
const labelCls = 'text-sm font-medium text-gray-700'

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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">
            {step === 'success' ? 'Order Confirmed!' : 'Quick Purchase'}
          </h2>
          <button onClick={handleClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 'success' ? (
          <div className="px-6 py-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-checkmark">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Order Placed!</h3>
            <p className="text-muted mb-1">Your order number is:</p>
            <p className="text-2xl font-mono font-bold text-brand mb-4">{orderNumber}</p>
            <p className="text-sm text-muted mb-6">
              We'll contact you on <strong className="text-gray-900">{form.phone}</strong> to confirm your delivery.
            </p>
            <Button onClick={handleClose} className="w-full">Continue Shopping</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* Product summary */}
            <div className="flex items-center gap-3 bg-surface rounded-xl p-3">
              <img
                src={product.image_url?.startsWith('http') ? product.image_url : `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${product.image_url}`}
                alt={product.title}
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{product.title}</p>
                <p className="text-sm text-brand font-bold">৳{product.price.toLocaleString()} each</p>
              </div>
              <div className="flex items-center border border-gray-200 rounded-xl bg-white">
                <button type="button" className="px-2.5 py-1.5 text-gray-600 font-medium hover:bg-gray-50 rounded-l-xl transition-colors cursor-pointer" onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
                <span className="w-8 text-center text-sm font-semibold text-gray-900 border-x border-gray-200">{qty}</span>
                <button type="button" className="px-2.5 py-1.5 text-gray-600 font-medium hover:bg-gray-50 rounded-r-xl transition-colors cursor-pointer" onClick={() => setQty(q => Math.min(product.stock_quantity, q + 1))}>+</button>
              </div>
            </div>

            {/* Contact & Shipping */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Delivery Information</h3>
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
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Method</h3>
              <label className="flex items-start gap-3 p-4 border border-brand/30 bg-brand-light/30 rounded-xl cursor-pointer">
                <input type="radio" name="payment_method" value="delivery_advance_cod" checked readOnly className="mt-0.5 accent-brand" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Advance + COD</p>
                  <p className="text-xs text-muted">Send ৳150 advance via bKash/Nagad, rest on delivery</p>
                </div>
              </label>

              {paymentMethod === 'delivery_advance_cod' && (
                <div className="mt-3 p-4 bg-brand-light/20 rounded-xl border border-brand/10 space-y-3">
                  <p className="text-sm font-semibold text-brand-dark">Advance Payment — ৳{DELIVERY_FEE}</p>
                  <div>
                    <label className={labelCls}>Send via</label>
                    <select value={advanceMethod} onChange={e => setAdvanceMethod(e.target.value)} className={inputCls}>
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="rocket">Rocket</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Transaction ID (optional)</label>
                    <input value={advanceTrxId} onChange={e => setAdvanceTrxId(e.target.value)} placeholder="TRX123456789" className={inputCls} />
                    <p className="text-xs text-muted mt-1">You can submit this later from your order page</p>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className={labelCls}>Order Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                placeholder="Any special instructions..."
                className={`${inputCls} resize-none`} />
            </div>

            {/* Order summary */}
            <div className="bg-surface rounded-xl p-4 text-sm space-y-1.5">
              <div className="flex justify-between text-muted">
                <span>{product.title} x{qty}</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Delivery fee</span>
                <span>৳{DELIVERY_FEE}</span>
              </div>
              {paymentMethod === 'delivery_advance_cod' && (
                <div className="flex justify-between text-brand font-medium">
                  <span>Advance now</span>
                  <span>৳{DELIVERY_FEE}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 mt-2">
                <span>Total</span>
                <span>৳{total.toLocaleString()}</span>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Place Order
            </Button>

            {!user && (
              <p className="text-xs text-center text-muted">
                No account needed. We'll call you to confirm.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
