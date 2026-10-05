import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { orders } from '@/lib/api/orders'
import { useAuth } from '@/lib/context/AuthContext'
import { OrderStatusBadge, AdvanceStatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Order } from '@/lib/types'

function SuccessBanner({ orderId }: { orderId: string }) {
  const [searchParams] = useSearchParams()
  const success = searchParams.get('success')
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (success) orders.get(orderId).then(r => { if (r.data) setOrder(r.data) })
  }, [success, orderId])

  if (!success) return null
  return (
    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
      ✅ Order placed successfully!{order && <> Your order number is <strong>{order.order_number}</strong>.</>}
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [advanceTrxId, setAdvanceTrxId] = useState('')
  const [advanceMethod, setAdvanceMethod] = useState('bkash')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')

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

  const handleSubmitAdvance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setSubmitting(true)
    try {
      const res = await orders.submitAdvance(id, { advance_payment_method: advanceMethod, advance_transaction_id: advanceTrxId })
      if (res.data) { setOrder(res.data); setMsg('Advance payment submitted!') }
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12 text-center">Loading...</div>
  if (!order) return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-500">Order not found.</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {id && <SuccessBanner orderId={id} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{order.order_number}</h1>
          <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Items</h2>
        <div className="space-y-2">
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-700">{item.product_title} ×{item.quantity}</span>
              <span className="font-medium">৳{item.subtotal.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="border-t mt-3 pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>৳{order.subtotal_amount.toLocaleString()}</span></div>
          <div className="flex justify-between text-gray-600"><span>Delivery fee</span><span>৳{order.delivery_fee.toLocaleString()}</span></div>
          <div className="flex justify-between font-bold text-gray-900"><span>Total</span><span>৳{order.total_amount.toLocaleString()}</span></div>
        </div>
      </div>

      {/* Shipping */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Shipping Address</h2>
        <p className="text-sm text-gray-700">
          {order.shipping_address.full_name} · {order.shipping_address.phone}<br />
          {order.shipping_address.address_line1}{order.shipping_address.address_line2 && `, ${order.shipping_address.address_line2}`}<br />
          {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}<br />
          {order.shipping_address.country}
        </p>
      </div>

      {/* Payment */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Payment</h2>
        <div className="text-sm space-y-1 text-gray-700">
          <div className="flex justify-between"><span>Method</span><span>{order.payment_method.replace(/_/g, ' ')}</span></div>
          <div className="flex justify-between"><span>Advance status</span><span><AdvanceStatusBadge status={order.advance_payment_status} /></span></div>
          {order.advance_transaction_id && (
            <div className="flex justify-between"><span>Advance TRX ID</span><span>{order.advance_transaction_id}</span></div>
          )}
          {order.delivery_advance_amount > 0 && (
            <div className="flex justify-between"><span>Advance amount</span><span>৳{order.delivery_advance_amount.toLocaleString()}</span></div>
          )}
          <div className="flex justify-between font-medium"><span>Due on delivery</span><span>৳{order.due_amount.toLocaleString()}</span></div>
        </div>
      </div>

      {/* Submit advance if needed */}
      {order.payment_method === 'delivery_advance_cod' && order.advance_payment_status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 mb-4">
          <h2 className="font-semibold text-yellow-900 mb-3">Submit Advance Payment</h2>
          <form onSubmit={handleSubmitAdvance} className="space-y-3">
            <select value={advanceMethod} onChange={e => setAdvanceMethod(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black">
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="rocket">Rocket</option>
            </select>
            <input required value={advanceTrxId} onChange={e => setAdvanceTrxId(e.target.value)} placeholder="Transaction ID" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" />
            <Button type="submit" loading={submitting} size="sm">Submit</Button>
          </form>
          {msg && <p className="text-sm text-green-700 mt-2">{msg}</p>}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 items-center">
        <Link to="/orders" className="text-sm text-brand hover:underline">← Back to orders</Link>
        {order.status === 'pending' && (
          <Button variant="danger" size="sm" loading={cancelling} onClick={handleCancel}>
            Cancel Order
          </Button>
        )}
      </div>
    </div>
  )
}
