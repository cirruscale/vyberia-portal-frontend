import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCmsAuth } from '@/lib/context/CmsAuthContext'
import { cmsOrders } from '@/lib/api/orders'
import { OrderStatusBadge, AdvanceStatusBadge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { Button } from '@/components/ui/Button'
import type { Order } from '@/lib/types'

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
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders ({total})</h1>

      <div className="flex gap-3 mb-6">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="border border-gray-300 rounded-md px-4 py-2 text-sm">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={advanceFilter} onChange={e => { setAdvanceFilter(e.target.value); setPage(1) }} className="border border-gray-300 rounded-md px-4 py-2 text-sm">
          <option value="">All Advance Status</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No orders found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Order #</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Customer</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Total</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Advance</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Date</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{o.order_number}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.shipping_address?.full_name}</p>
                    <p className="text-xs text-gray-500">{o.shipping_address?.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">৳{o.total_amount.toLocaleString()}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                  <td className="px-4 py-3"><AdvanceStatusBadge status={o.advance_payment_status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelectedOrder(o)} className="text-indigo-600 hover:underline text-xs">Manage</button>
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

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdatingStatus(true)
    try {
      await cmsOrders.updateStatus(order.id, newStatus, notes)
      setMsg('Status updated!')
      setTimeout(onSaved, 1000)
    } finally { setUpdatingStatus(false) }
  }

  const handleAdvanceVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdatingAdvance(true)
    try {
      await cmsOrders.verifyAdvance(order.id, advanceStatus, advanceNotes)
      setMsg('Advance payment ' + advanceStatus + '!')
      setTimeout(onSaved, 1000)
    } finally { setUpdatingAdvance(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold">{order.order_number}</h2>
            <p className="text-sm text-gray-500">৳{order.total_amount.toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Items</p>
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm py-1">
                <span className="text-gray-600">{item.product_title} ×{item.quantity}</span>
                <span>৳{item.subtotal.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleStatusUpdate} className="border rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Update Status</p>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value as typeof newStatus)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-3">
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-3" />
            <Button type="submit" loading={updatingStatus} size="sm">Update Status</Button>
          </form>

          {['submitted', 'pending'].includes(order.advance_payment_status) && order.payment_method === 'delivery_advance_cod' && (
            <form onSubmit={handleAdvanceVerify} className="border border-blue-200 bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">Verify Advance Payment</p>
              {order.advance_transaction_id && (
                <p className="text-xs text-blue-700 mb-3">TRX: {order.advance_transaction_id} via {order.advance_payment_method}</p>
              )}
              <select value={advanceStatus} onChange={e => setAdvanceStatus(e.target.value as 'verified' | 'rejected')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-3">
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
              <input value={advanceNotes} onChange={e => setAdvanceNotes(e.target.value)} placeholder="Notes" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-3" />
              <Button type="submit" loading={updatingAdvance} size="sm">Submit Verification</Button>
            </form>
          )}

          {msg && <p className="text-sm text-green-700 font-medium">{msg}</p>}
        </div>
      </div>
    </div>
  )
}
