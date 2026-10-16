import { useState } from 'react'
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

const inputCls = 'mt-1.5 w-full border border-[#ddd] rounded-[3px] px-3.5 py-2.5 text-[13px] text-dark bg-white outline-none focus:border-dark transition-colors'
const labelCls = 'text-[13px] text-[#555]'

export default function GuestCheckoutModal({ product, initialQty, isOpen, onClose }: Props) {
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('form')
  const [orderNumber, setOrderNumber] = useState('')
  const [qty, setQty] = useState(initialQty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    full_name: user?.name ?? '', phone: user?.phone ?? '',
    address_line1: '', address_line2: '', city: 'Dhaka', state: 'Dhaka', postal_code: '', country: 'Bangladesh',
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
        shipping_address: form, payment_method: paymentMethod,
        delivery_fee: DELIVERY_FEE, notes: notes || undefined,
      }
      if (paymentMethod === 'delivery_advance_cod') {
        payload.delivery_advance_amount = DELIVERY_FEE
        payload.advance_payment_method = advanceMethod
        if (advanceTrxId) payload.advance_transaction_id = advanceTrxId
      }
      let res
      if (user) {
        res = await orders.checkout({
          items: payload.items, shipping_address: payload.shipping_address,
          payment_method: payload.payment_method, delivery_fee: payload.delivery_fee,
          delivery_advance_amount: payload.delivery_advance_amount,
          advance_payment_method: payload.advance_payment_method,
          advance_transaction_id: payload.advance_transaction_id, notes: payload.notes,
        })
      } else {
        res = await orders.guestCheckout(payload)
      }
      if (res.data) { setOrderNumber(res.data.order_number); setStep('success') }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally { setLoading(false) }
  }

  const handleClose = () => { setStep('form'); setError(''); onClose() }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={handleClose} />

      <div className="relative bg-white rounded-[6px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eee] sticky top-0 bg-white z-10">
          <h2 className="text-[16px] font-semibold">
            {step === 'success' ? 'Order Confirmed' : 'Quick Purchase'}
          </h2>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center text-[#999] hover:text-dark transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 'success' ? (
          <div className="px-6 py-12 text-center">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-green-600 animate-checkmark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-[20px] font-semibold mb-2">Order Placed!</h3>
            <p className="text-[14px] text-muted mb-1">Your order number:</p>
            <p className="text-[22px] font-mono font-semibold text-brand mb-5">{orderNumber}</p>
            <p className="text-[13px] text-muted mb-8">
              We'll contact you on <strong className="text-dark">{form.phone}</strong> to confirm delivery.
            </p>
            <button onClick={handleClose} className="w-full h-[46px] bg-dark text-white text-[13px] font-medium rounded-full hover:bg-brand transition-colors cursor-pointer">
              Continue Shopping
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* Product */}
            <div className="flex items-center gap-3 bg-[#fafafa] rounded-[4px] p-3">
              <img
                src={product.image_url?.startsWith('http') ? product.image_url : `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${product.image_url}`}
                alt={product.title}
                className="w-14 h-14 rounded-[3px] object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate">{product.title}</p>
                <p className="text-[13px] text-brand font-semibold">৳{product.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center border border-[#ddd] rounded-[3px] bg-white">
                <button type="button" className="w-8 h-8 flex items-center justify-center text-[#999] hover:text-dark cursor-pointer" onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
                <span className="w-7 text-center text-[13px] font-medium border-x border-[#ddd]">{qty}</span>
                <button type="button" className="w-8 h-8 flex items-center justify-center text-[#999] hover:text-dark cursor-pointer" onClick={() => setQty(q => Math.min(product.stock_quantity, q + 1))}>+</button>
              </div>
            </div>

            {/* Delivery */}
            <div>
              <h3 className="text-[13px] font-semibold mb-3">Delivery Information</h3>
              <div className="space-y-3">
                <div><label className={labelCls}>Full Name *</label><input required value={form.full_name} onChange={field('full_name')} placeholder="Your full name" className={inputCls} /></div>
                <div><label className={labelCls}>Phone *</label><input required value={form.phone} onChange={field('phone')} placeholder="01XXXXXXXXX" className={inputCls} /></div>
                <div><label className={labelCls}>Address *</label><input required value={form.address_line1} onChange={field('address_line1')} placeholder="House, Road, Area" className={inputCls} /></div>
                <div><label className={labelCls}>Apartment / Floor</label><input value={form.address_line2} onChange={field('address_line2')} placeholder="Optional" className={inputCls} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>City *</label><input required value={form.city} onChange={field('city')} className={inputCls} /></div>
                  <div><label className={labelCls}>Postal Code</label><input value={form.postal_code} onChange={field('postal_code')} placeholder="1000" className={inputCls} /></div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div>
              <h3 className="text-[13px] font-semibold mb-3">Payment</h3>
              <label className="flex items-start gap-3 p-3.5 border border-dark rounded-[3px] cursor-pointer">
                <input type="radio" name="payment_method" value="delivery_advance_cod" checked readOnly className="mt-0.5 accent-dark" />
                <div>
                  <p className="text-[13px] font-medium">Advance + COD</p>
                  <p className="text-[11px] text-muted mt-0.5">Send ৳150 advance, rest on delivery</p>
                </div>
              </label>
              {paymentMethod === 'delivery_advance_cod' && (
                <div className="mt-3 p-4 bg-[#fafafa] rounded-[3px] space-y-3">
                  <p className="text-[13px] font-semibold">Advance — ৳{DELIVERY_FEE}</p>
                  <div><label className={labelCls}>Send via</label><select value={advanceMethod} onChange={e => setAdvanceMethod(e.target.value)} className={inputCls}><option value="bkash">bKash</option><option value="nagad">Nagad</option><option value="rocket">Rocket</option></select></div>
                  <div><label className={labelCls}>Transaction ID (optional)</label><input value={advanceTrxId} onChange={e => setAdvanceTrxId(e.target.value)} placeholder="TRX123456789" className={inputCls} /><p className="text-[11px] text-muted mt-1">You can submit this later</p></div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className={labelCls}>Order Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Special instructions..." className={`${inputCls} resize-none`} />
            </div>

            {/* Summary */}
            <div className="bg-[#fafafa] rounded-[4px] p-4 text-[13px] space-y-2">
              <div className="flex justify-between text-[#666]"><span>{product.title} x{qty}</span><span>৳{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-[#666]"><span>Delivery</span><span>৳{DELIVERY_FEE}</span></div>
              {paymentMethod === 'delivery_advance_cod' && <div className="flex justify-between text-brand font-medium"><span>Advance</span><span>৳{DELIVERY_FEE}</span></div>}
              <div className="flex justify-between font-semibold text-dark border-t border-[#ddd] pt-2.5 mt-2"><span>Total</span><span>৳{total.toLocaleString()}</span></div>
            </div>

            {error && <p className="text-[13px] text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[46px] bg-dark text-white text-[13px] font-medium rounded-full hover:bg-brand transition-colors cursor-pointer disabled:opacity-50 uppercase tracking-[0.05em]"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>

            {!user && <p className="text-[11px] text-center text-muted">No account needed. We'll call to confirm.</p>}
          </form>
        )}
      </div>
    </div>
  )
}
