import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { orders } from '@/lib/api/orders'
import { useAuth } from '@/lib/context/AuthContext'
import { OrderStatusBadge, AdvanceStatusBadge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import type { Order } from '@/lib/types'

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const [items, setItems] = useState<Order[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    orders.myOrders(page).then(r => {
      setItems(r.data?.items ?? [])
      setTotalPages(r.data?.total_pages ?? 1)
    }).finally(() => setLoading(false))
  }, [user, page])

  if (authLoading || loading) return (
    <div className="max-w-4xl mx-auto py-12 animate-pulse space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 h-24" />
      ))}
    </div>
  )

  if (!user) return (
    <div className="max-w-4xl mx-auto py-20 text-center animate-fade-in">
      <p className="text-muted mb-4">Please sign in to view your orders.</p>
      <Link to="/login" className="text-brand hover:text-brand-hover font-medium transition-colors">Sign in</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-muted mb-2">No orders yet.</p>
          <Link to="/products" className="text-brand hover:text-brand-hover font-medium text-sm transition-colors">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(order => (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-brand/20 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900">{order.order_number}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex items-center gap-4 text-sm text-muted">
                  <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                  <span className="font-medium text-gray-900">৳{order.total_amount.toLocaleString()}</span>
                  <AdvanceStatusBadge status={order.advance_payment_status} />
                </div>
                <div className="text-xs text-muted mt-2">
                  {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}
