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

  if (authLoading || loading) return <div className="max-w-4xl mx-auto px-4 py-12 text-center">Loading...</div>

  if (!user) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-500 mb-4">Please sign in to view your orders.</p>
      <Link to="/login" className="text-brand hover:underline">Sign in</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>No orders yet.</p>
          <Link to="/products" className="text-brand hover:underline mt-2 block">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(order => (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900">{order.order_number}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                  <span>৳{order.total_amount.toLocaleString()}</span>
                  <AdvanceStatusBadge status={order.advance_payment_status} />
                </div>
                <div className="text-xs text-gray-400 mt-2">
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
