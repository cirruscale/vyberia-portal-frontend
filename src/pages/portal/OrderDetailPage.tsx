import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { orders } from '@/lib/api/orders'
import { useAuth } from '@/lib/context/AuthContext'
import { OrderStatusBadge, AdvanceStatusBadge } from '@/components/ui/Badge'
import type { Order, ShippingAddress } from '@/lib/types'

const inputClass = 'w-full border border-[#E0D8CE] bg-[#FAF9F7] px-4 py-2.5 text-[13px] text-[#2A1F14] outline-none focus:border-[#B8956A] transition-colors'
const labelClass = 'block text-[10px] tracking-[0.1em] uppercase text-[#7A7067] mb-1.5'

function SuccessBanner({ orderId }: { orderId: string }) {
  const [searchParams] = useSearchParams()
  const success = searchParams.get('success')
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (success) orders.get(orderId).then(r => { if (r.data) setOrder(r.data) })
  }, [success, orderId])

  if (!success) return null
  return (
    <div className="mb-8 bg-[#F0FAF3] border border-[#B8DFC4] p-5 flex items-center gap-4 animate-fade-in">
      <div className="w-8 h-8 bg-[#6BAF7A] flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <div>
        <p className="text-[13px] font-medium text-[#2A5A35]">Order placed successfully!</p>
        {order && <p className="text-[12px] text-[#4A8A5A] mt-0.5">Order number: {order.order_number}</p>}
      </div>
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
    try { const res = await orders.cancel(id); if (res.data) setOrder(res.data) } finally { setCancelling(false) }
  }

  const openEditAddress = () => {
    if (!order) return
    setAddrForm({ ...order.shipping_address }); setAddrMsg(''); setEditingAddress(true)
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !addrForm) return
    setSavingAddr(true); setAddrMsg('')
    try {
      const res = await orders.updateShippingAddress(id, addrForm)
      if (res.data) { setOrder(res.data); setEditingAddress(false); setAddrMsg('Address updated.') }
    } catch (err: unknown) { setAddrMsg(err instanceof Error ? err.message : 'Failed to update address') }
    finally { setSavingAddr(false) }
  }

  const openEditPayment = () => {
    if (!order) return
    setPayMethod(order.payment_method)
    setPayAdvanceMethod(order.advance_payment_method || 'bkash')
    setPayTrxId(order.advance_transaction_id || '')
    setPayMsg(''); setEditingPayment(true)
  }

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setSavingPayment(true); setPayMsg('')
    try {
      const res = await orders.updatePaymentDetails(id, {
        payment_method: payMethod as Order['payment_method'],
        advance_payment_method: payAdvanceMethod,
        advance_transaction_id: payTrxId
      })
      if (res.data) { setOrder(res.data); setEditingPayment(false); setPayMsg('Payment details updated.') }
    } catch (err: unknown) { setPayMsg(err instanceof Error ? err.message : 'Failed to update payment') }
    finally { setSavingPayment(false) }
  }

  if (loading) return (
    <div className="max-w-[680px] mx-auto px-6 sm:px-8 lg:px-12 py-16 space-y-5">
      <div className="h-3 skeleton-shimmer w-32" />
      <div className="h-8 skeleton-shimmer w-56" />
      <div className="border border-[#E0D8CE] p-8 h-40 skeleton-shimmer" />
    </div>
  )

  if (!order) return (
    <div className="max-w-[680px] mx-auto px-6 sm:px-8 lg:px-12 py-24 text-center">
      <p className="font-display text-[22px] font-light text-[#7A7067]">Order not found.</p>
    </div>
  )

  const ghost = 'h-[38px] px-5 border border-[#E0D8CE] text-[11px] tracking-[0.08em] uppercase text-[#7A7067] hover:border-[#B8956A] hover:text-[#B8956A] transition-colors cursor-pointer bg-transparent'
  const ghostSm = 'h-[34px] px-4 border border-[#E0D8CE] text-[10px] tracking-[0.08em] uppercase text-[#7A7067] hover:border-[#B8956A] hover:text-[#B8956A] transition-colors cursor-pointer bg-transparent'
  const primary = 'h-[38px] px-5 bg-[#B8956A] text-[#FAF9F7] text-[11px] tracking-[0.08em] uppercase hover:bg-[#9A7A54] transition-colors cursor-pointer disabled:opacity-40'

  return (
    <div className="max-w-[680px] mx-auto px-6 sm:px-8 lg:px-12 py-12 animate-fade-in">
      {id && <SuccessBanner orderId={id} />}

      {/* Back */}
      <Link to="/orders" className="inline-flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase text-[#7A7067] hover:text-[#B8956A] transition-colors mb-10">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        All Orders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-10 pb-8 border-b border-[#E0D8CE]">
        <div>
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#B8956A] mb-2">Order</p>
          <h1 className="font-display text-[28px] font-light text-[#2A1F14]">{order.order_number}</h1>
          <p className="text-[12px] text-[#7A7067] mt-1">
            {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Items */}
      <section className="mb-8 pb-8 border-b border-[#E0D8CE]">
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#B8956A] mb-5">Items</p>
        <div className="space-y-3">
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between items-start text-[13px] py-2">
              <span className="text-[#2A1F14]">
                {item.product_title}
                <span className="text-[#B8956A] ml-2">× {item.quantity}</span>
              </span>
              <span className="font-medium text-[#2A1F14] ml-4 flex-shrink-0">৳{item.subtotal.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-5 border-t border-[#E0D8CE] space-y-2.5 text-[13px]">
          <div className="flex justify-between text-[#7A7067]">
            <span>Subtotal</span><span>৳{order.subtotal_amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[#7A7067]">
            <span>Delivery</span><span>৳{order.delivery_fee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-medium text-[#2A1F14] pt-3 border-t border-[#E0D8CE]">
            <span>Total</span>
            <span className="font-display text-[18px] font-light">৳{order.total_amount.toLocaleString()}</span>
          </div>
        </div>
      </section>

      {/* Shipping */}
      <section className="mb-8 pb-8 border-b border-[#E0D8CE]">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#B8956A]">Shipping address</p>
          {order.status === 'pending' && !editingAddress && (
            <button onClick={openEditAddress} className={ghostSm}>Edit</button>
          )}
        </div>
        {addrMsg && !editingAddress && (
          <p className="text-[12px] text-[#6BAF7A] mb-4 tracking-[0.02em]">{addrMsg}</p>
        )}
        {editingAddress && addrForm ? (
          <form onSubmit={handleSaveAddress} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Full name</label><input required value={addrForm.full_name} onChange={e => setAddrForm({ ...addrForm, full_name: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>Phone</label><input required value={addrForm.phone} onChange={e => setAddrForm({ ...addrForm, phone: e.target.value })} className={inputClass} /></div>
            </div>
            <div><label className={labelClass}>Address</label><input required value={addrForm.address_line1} onChange={e => setAddrForm({ ...addrForm, address_line1: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Address line 2 (optional)</label><input value={addrForm.address_line2 ?? ''} onChange={e => setAddrForm({ ...addrForm, address_line2: e.target.value })} className={inputClass} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className={labelClass}>City</label><input required value={addrForm.city} onChange={e => setAddrForm({ ...addrForm, city: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>State</label><input required value={addrForm.state} onChange={e => setAddrForm({ ...addrForm, state: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>Postal code</label><input required value={addrForm.postal_code} onChange={e => setAddrForm({ ...addrForm, postal_code: e.target.value })} className={inputClass} /></div>
            </div>
            <div><label className={labelClass}>Country</label><input required value={addrForm.country} onChange={e => setAddrForm({ ...addrForm, country: e.target.value })} className={inputClass} /></div>
            {addrMsg && <p className="text-[12px] text-red-500">{addrMsg}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={savingAddr} className={primary}>{savingAddr ? 'Saving...' : 'Save'}</button>
              <button type="button" className={ghost} onClick={() => { setEditingAddress(false); setAddrMsg('') }}>Cancel</button>
            </div>
          </form>
        ) : (
          <p className="text-[13px] text-[#7A7067] leading-[1.9] font-light">
            {order.shipping_address.full_name} &middot; {order.shipping_address.phone}<br />
            {order.shipping_address.address_line1}
            {order.shipping_address.address_line2 && `, ${order.shipping_address.address_line2}`}<br />
            {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}<br />
            {order.shipping_address.country}
          </p>
        )}
      </section>

      {/* Payment */}
      <section className="mb-10 pb-8 border-b border-[#E0D8CE]">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#B8956A]">Payment</p>
          {order.status === 'pending' && order.advance_payment_status !== 'verified' && !editingPayment && (
            <button onClick={openEditPayment} className={ghostSm}>Edit</button>
          )}
        </div>
        {payMsg && !editingPayment && (
          <p className="text-[12px] text-[#6BAF7A] mb-4 tracking-[0.02em]">{payMsg}</p>
        )}
        {editingPayment ? (
          <form onSubmit={handleSavePayment} className="space-y-4">
            <div>
              <label className={labelClass}>Payment method</label>
              <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className={inputClass}>
                <option value="cash_on_delivery">Cash on Delivery</option>
                <option value="delivery_advance_cod">Delivery Advance + COD</option>
              </select>
            </div>
            {payMethod === 'delivery_advance_cod' && (
              <>
                <div>
                  <label className={labelClass}>Advance via</label>
                  <select value={payAdvanceMethod} onChange={e => setPayAdvanceMethod(e.target.value)} className={inputClass}>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Transaction ID</label>
                  <input value={payTrxId} onChange={e => setPayTrxId(e.target.value)} placeholder="e.g. 8N7A3KD2F1" className={inputClass} />
                </div>
              </>
            )}
            {payMsg && <p className="text-[12px] text-red-500">{payMsg}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={savingPayment} className={primary}>{savingPayment ? 'Saving...' : 'Save'}</button>
              <button type="button" className={ghost} onClick={() => { setEditingPayment(false); setPayMsg('') }}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 text-[13px]">
            <div className="flex justify-between">
              <span className="text-[#7A7067]">Method</span>
              <span className="capitalize text-[#2A1F14]">{order.payment_method.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#7A7067]">Advance</span>
              <AdvanceStatusBadge status={order.advance_payment_status} />
            </div>
            {order.advance_payment_method && (
              <div className="flex justify-between">
                <span className="text-[#7A7067]">Via</span>
                <span className="capitalize text-[#2A1F14]">{order.advance_payment_method}</span>
              </div>
            )}
            {order.advance_transaction_id && (
              <div className="flex justify-between">
                <span className="text-[#7A7067]">TRX ID</span>
                <span className="font-mono text-[12px] text-[#2A1F14]">{order.advance_transaction_id}</span>
              </div>
            )}
            {order.delivery_advance_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-[#7A7067]">Advance paid</span>
                <span className="text-[#2A1F14]">৳{order.delivery_advance_amount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-[#E0D8CE]">
              <span className="font-medium text-[#2A1F14]">Due on delivery</span>
              <span className="font-display text-[18px] font-light text-[#2A1F14]">৳{order.due_amount.toLocaleString()}</span>
            </div>
          </div>
        )}
      </section>

      {order.status === 'pending' && (
        <div className="flex justify-end">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="h-[42px] px-6 border border-red-300 text-red-500 text-[11px] tracking-[0.08em] uppercase hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        </div>
      )}
    </div>
  )
}
