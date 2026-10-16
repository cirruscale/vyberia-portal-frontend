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
    <div className="max-w-[800px] mx-auto px-5 sm:px-8 lg:px-12 py-12 animate-pulse space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border-b border-[#eee] py-6 h-24" />
      ))}
    </div>
  )

  if (!user) return (
    <div className="max-w-[600px] mx-auto px-5 sm:px-8 py-24 text-center animate-fade-in">
      <p className="text-muted mb-6">Please sign in to view your orders.</p>
      <Link to="/login" className="inline-flex items-center gap-2 px-7 py-3 bg-dark text-white text-[13px] font-medium rounded-full hover:bg-brand transition-colors">Sign in</Link>
    </div>
  )

  return (
    <div className="max-w-[800px] mx-auto px-5 sm:px-8 lg:px-12 py-8 animate-fade-in">
      <h1 className="text-[26px] font-semibold tracking-[-0.02em] mb-10">Orders</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[16px] font-medium mb-2">No orders yet</p>
          <p className="text-[14px] text-muted mb-8">When you place an order, it will appear here.</p>
          <Link to="/products" className="inline-flex items-center gap-2 px-7 py-3 bg-dark text-white text-[13px] font-medium rounded-full hover:bg-brand transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div>
          {items.map(order => (
            <Link key={order.id} to={`/orders/${order.id}`} className="block border-b border-[#eee] py-5 hover:bg-[#fafafa] -mx-4 px-4 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] font-medium">{order.order_number}</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[13px] text-muted">
                <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                <span className="font-medium text-dark">৳{order.total_amount.toLocaleString()}</span>
                <AdvanceStatusBadge status={order.advance_payment_status} />
                <span className="ml-auto text-[12px]">
                  {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}
