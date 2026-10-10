import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCmsAuth } from '@/lib/context/CmsAuthContext'
import { cmsOrders } from '@/lib/api/orders'
import { OrderStatusBadge, AdvanceStatusBadge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { Button } from '@/components/ui/Button'
import type { Order } from '@/lib/types'

const inputCls = 'border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500'

export default function CMSOrdersPage() {
  const { user, loading: authLoading } = useCmsAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [advanceFilter, setAdvanceFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!authLoading && !user) navigate('/cms/login', { replace: true })
  }, [user, authLoading, navigate])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await cmsOrders.list({
        page, page_size: 20,
        ...(statusFilter && { status: statusFilter }),
        ...(advanceFilter && { advance_status: advanceFilter }),
      })
      setItems(res.data?.items ?? [])
      setTotal(res.data?.total ?? 0)
      setTotalPages(res.data?.total_pages ?? 1)
    } finally { setLoading(false) }
  }, [page, statusFilter, advanceFilter])

  useEffect(() => { if (user) load() }, [user, load])

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="text-slate-500 text-sm mt-0.5">{total} total orders</p>
      </div>

      <div className="flex gap-3 mb-5">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className={inputCls}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={advanceFilter} onChange={e => { setAdvanceFilter(e.target.value); setPage(1) }} className={inputCls}>
          <option value="">All Advance</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No orders found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ background: '#F8FAFC' }}>
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500">Order #</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500">Customer</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500">Total</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500">Advance</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500">Date</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map(o => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{o.order_number}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-900">{o.shipping_address?.full_name}</p>
                    <p className="text-xs text-slate-400">{o.shipping_address?.phone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-900">৳{o.total_amount.toLocaleString()}</td>
                  <td className="px-5 py-3.5"><OrderStatusBadge status={o.status} /></td>
                  <td className="px-5 py-3.5"><AdvanceStatusBadge status={o.advance_payment_status} /></td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => setSelectedOrder(o)} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {selectedOrder && (
        <OrderManageModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onSaved={() => { setSelectedOrder(null); load() }} />
      )}
    </div>
  )
}

function OrderManageModal({ order, onClose, onSaved }: { order: Order; onClose: () => void; onSaved: () => void }) {
  const [newStatus, setNewStatus] = useState(order.status)
  const [notes, setNotes] = useState('')
  const [advanceStatus, setAdvanceStatus] = useState<'verified' | 'rejected'>('verified')
  const [advanceNotes, setAdvanceNotes] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [updatingAdvance, setUpdatingAdvance] = useState(false)
  const [msg, setMsg] = useState('')

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdatingStatus(true)
    try {
      await cmsOrders.updateStatus(order.id, newStatus, notes)
      setMsg('Status updated successfully')
      setTimeout(onSaved, 1200)
    } finally { setUpdatingStatus(false) }
  }

  const handleAdvanceVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdatingAdvance(true)
    try {
      await cmsOrders.verifyAdvance(order.id, advanceStatus, advanceNotes)
      setMsg(`Advance payment ${advanceStatus}`)
      setTimeout(onSaved, 1200)
    } finally { setUpdatingAdvance(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">{order.order_number}</h2>
            <p className="text-sm text-slate-500">৳{order.total_amount.toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Items */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Order Items</p>
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm py-1.5">
                <span className="text-slate-700">{item.product_title} <span className="text-slate-400">×{item.quantity}</span></span>
                <span className="font-medium text-slate-900">৳{item.subtotal.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Status update */}
          <form onSubmit={handleStatusUpdate} className="border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Update Status</p>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value as typeof newStatus)} className={`${inputCls} mb-3`}>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" className={`${inputCls} mb-3`} />
            <Button type="submit" loading={updatingStatus} size="sm">Update Status</Button>
          </form>

          {/* Advance verification */}
          {['submitted', 'pending'].includes(order.advance_payment_status) && order.payment_method === 'delivery_advance_cod' && (
            <form onSubmit={handleAdvanceVerify} className="border border-indigo-200 rounded-xl p-4" style={{ background: '#EEF2FF' }}>
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-3">Verify Advance Payment</p>
              {order.advance_transaction_id && (
                <p className="text-xs text-indigo-600 mb-3 font-medium">TRX: {order.advance_transaction_id} via {order.advance_payment_method}</p>
              )}
              <select value={advanceStatus} onChange={e => setAdvanceStatus(e.target.value as 'verified' | 'rejected')} className={`${inputCls} mb-3`}>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
              <input value={advanceNotes} onChange={e => setAdvanceNotes(e.target.value)} placeholder="Notes" className={`${inputCls} mb-3`} />
              <Button type="submit" loading={updatingAdvance} size="sm">Submit Verification</Button>
            </form>
          )}

          {msg && (
            <div className="rounded-lg px-4 py-3 text-sm text-green-700 font-medium" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              {msg}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
