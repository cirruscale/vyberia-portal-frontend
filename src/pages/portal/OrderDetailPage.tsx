import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { orders } from '@/lib/api/orders'
import { useAuth } from '@/lib/context/AuthContext'
import { OrderStatusBadge, AdvanceStatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Order, ShippingAddress } from '@/lib/types'

const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all'

function SuccessBanner({ orderId }: { orderId: string }) {
  const [searchParams] = useSearchParams()
  const success = searchParams.get('success')
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (success) orders.get(orderId).then(r => { if (r.data) setOrder(r.data) })
  }, [success, orderId])

  if (!success) return null
  return (
    <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 text-green-800 text-sm flex items-center gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span>Order placed successfully!{order && <> Your order number is <strong>{order.order_number}</strong>.</>}</span>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  const [editingAddress, setEditingAddress] = useState(false)
  const [addrForm, setAddrForm] = useState<ShippingAddress | null>(null)
  const [savingAddr, setSavingAddr] = useState(false)
  const [addrMsg, setAddrMsg] = useState('')

  const [editingPayment, setEditingPayment] = useState(false)
  const [payMethod, setPayMethod] = useState<string>('cash_on_delivery')
  const [payAdvanceMethod, setPayAdvanceMethod] = useState('bkash')
  const [payTrxId, setPayTrxId] = useState('')
  const [savingPayment, setSavingPayment] = useState(false)
  const [payMsg, setPayMsg] = useState('')

  const load = () => {
    if (!id) return
    orders.get(id).then(r => { if (r.data) setOrder(r.data) }).finally(() => setLoading(false))
  }

  useEffect(() => { if (user) load() }, [user, id])

  const handleCancel = async () => {
    if (!id || !confirm('Cancel this order?')) return
    setCancelling(true)
    try {
      const res = await orders.cancel(id)
      if (res.data) setOrder(res.data)
    } finally { setCancelling(false) }
  }

  const openEditAddress = () => {
    if (!order) return
    setAddrForm({ ...order.shipping_address })
    setAddrMsg('')
    setEditingAddress(true)
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !addrForm) return
    setSavingAddr(true)
    setAddrMsg('')
    try {
      const res = await orders.updateShippingAddress(id, addrForm)
      if (res.data) { setOrder(res.data); setEditingAddress(false); setAddrMsg('Address updated!') }
    } catch (err: unknown) {
      setAddrMsg(err instanceof Error ? err.message : 'Failed to update address')
    } finally { setSavingAddr(false) }
  }

  const openEditPayment = () => {
    if (!order) return
    setPayMethod(order.payment_method)
    setPayAdvanceMethod(order.advance_payment_method || 'bkash')
    setPayTrxId(order.advance_transaction_id || '')
    setPayMsg('')
    setEditingPayment(true)
  }

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setSavingPayment(true)
    setPayMsg('')
    try {
      const res = await orders.updatePaymentDetails(id, {
        payment_method: payMethod as Order['payment_method'],
        advance_payment_method: payAdvanceMethod,
        advance_transaction_id: payTrxId,
      })
      if (res.data) { setOrder(res.data); setEditingPayment(false); setPayMsg('Payment details updated!') }
    } catch (err: unknown) {
      setPayMsg(err instanceof Error ? err.message : 'Failed to update payment')
    } finally { setSavingPayment(false) }
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto py-12 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      <div className="bg-white rounded-2xl border border-gray-200 p-5 h-40" />
      <div className="bg-white rounded-2xl border border-gray-200 p-5 h-32" />
    </div>
  )

  if (!order) return <div className="max-w-3xl mx-auto py-12 text-center text-muted">Order not found.</div>

  return (
    <div className="max-w-3xl mx-auto py-8 animate-fade-in">
      {id && <SuccessBanner orderId={id} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{order.order_number}</h1>
          <p className="text-sm text-muted">{new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Items</h2>
        <div className="space-y-2">
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-700">{item.product_title} x{item.quantity}</span>
              <span className="font-medium">৳{item.subtotal.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-3 pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-muted"><span>Subtotal</span><span>৳{order.subtotal_amount.toLocaleString()}</span></div>
          <div className="flex justify-between text-muted"><span>Delivery fee</span><span>৳{order.delivery_fee.toLocaleString()}</span></div>
          <div className="flex justify-between font-bold text-gray-900 pt-1"><span>Total</span><span>৳{order.total_amount.toLocaleString()}</span></div>
        </div>
      </div>

      {/* Shipping */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Shipping Address</h2>
          {order.status === 'pending' && !editingAddress && (
            <Button size="sm" variant="ghost" onClick={openEditAddress}>Edit</Button>
          )}
        </div>

        {addrMsg && !editingAddress && <p className="text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg mb-2">{addrMsg}</p>}

        {editingAddress && addrForm ? (
          <form onSubmit={handleSaveAddress} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full name</label>
                <input required value={addrForm.full_name} onChange={e => setAddrForm({ ...addrForm, full_name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <input required value={addrForm.phone} onChange={e => setAddrForm({ ...addrForm, phone: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Address line 1</label>
              <input required value={addrForm.address_line1} onChange={e => setAddrForm({ ...addrForm, address_line1: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Address line 2 (optional)</label>
              <input value={addrForm.address_line2 ?? ''} onChange={e => setAddrForm({ ...addrForm, address_line2: e.target.value })} className={inputClass} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                <input required value={addrForm.city} onChange={e => setAddrForm({ ...addrForm, city: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                <input required value={addrForm.state} onChange={e => setAddrForm({ ...addrForm, state: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Postal code</label>
                <input required value={addrForm.postal_code} onChange={e => setAddrForm({ ...addrForm, postal_code: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
              <input required value={addrForm.country} onChange={e => setAddrForm({ ...addrForm, country: e.target.value })} className={inputClass} />
            </div>
            {addrMsg && <p className="text-xs text-red-600">{addrMsg}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={savingAddr}>Save</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => { setEditingAddress(false); setAddrMsg('') }}>Cancel</Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-gray-600 leading-relaxed">
            {order.shipping_address.full_name} &middot; {order.shipping_address.phone}<br />
            {order.shipping_address.address_line1}{order.shipping_address.address_line2 && `, ${order.shipping_address.address_line2}`}<br />
            {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}<br />
            {order.shipping_address.country}
          </p>
        )}
      </div>

      {/* Payment */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Payment</h2>
          {order.status === 'pending' && order.advance_payment_status !== 'verified' && !editingPayment && (
            <Button size="sm" variant="ghost" onClick={openEditPayment}>Edit</Button>
          )}
        </div>

        {payMsg && !editingPayment && <p className="text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg mb-2">{payMsg}</p>}

        {editingPayment ? (
          <form onSubmit={handleSavePayment} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Payment method</label>
              <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className={inputClass}>
                <option value="cash_on_delivery">Cash on Delivery</option>
                <option value="delivery_advance_cod">Delivery Advance + COD</option>
              </select>
            </div>
            {payMethod === 'delivery_advance_cod' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Advance payment via</label>
                  <select value={payAdvanceMethod} onChange={e => setPayAdvanceMethod(e.target.value)} className={inputClass}>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Transaction ID</label>
                  <input value={payTrxId} onChange={e => setPayTrxId(e.target.value)} placeholder="e.g. 8N7A3KD2F1" className={inputClass} />
                </div>
              </>
            )}
            {payMsg && <p className="text-xs text-red-600">{payMsg}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={savingPayment}>Save</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => { setEditingPayment(false); setPayMsg('') }}>Cancel</Button>
            </div>
          </form>
        ) : (
          <div className="text-sm space-y-2 text-gray-600">
            <div className="flex justify-between"><span>Method</span><span className="capitalize text-gray-900">{order.payment_method.replace(/_/g, ' ')}</span></div>
            <div className="flex justify-between items-center"><span>Advance status</span><AdvanceStatusBadge status={order.advance_payment_status} /></div>
            {order.advance_payment_method && (
              <div className="flex justify-between"><span>Advance via</span><span className="capitalize text-gray-900">{order.advance_payment_method}</span></div>
            )}
            {order.advance_transaction_id && (
              <div className="flex justify-between"><span>TRX ID</span><span className="font-mono text-xs text-gray-900">{order.advance_transaction_id}</span></div>
            )}
            {order.delivery_advance_amount > 0 && (
              <div className="flex justify-between"><span>Advance amount</span><span className="text-gray-900">৳{order.delivery_advance_amount.toLocaleString()}</span></div>
            )}
            <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-100"><span>Due on delivery</span><span>৳{order.due_amount.toLocaleString()}</span></div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 items-center">
        <Link to="/orders" className="text-sm text-brand hover:text-brand-hover font-medium transition-colors">
          &larr; Back to orders
        </Link>
        {order.status === 'pending' && (
          <Button variant="danger" size="sm" loading={cancelling} onClick={handleCancel}>
            Cancel Order
          </Button>
        )}
      </div>
    </div>
  )
}
