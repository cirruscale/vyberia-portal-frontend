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
    <div className="max-w-[760px] mx-auto px-6 sm:px-8 lg:px-12 py-16 space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border border-[#E0D8CE] p-6 h-24 skeleton-shimmer" />
      ))}
    </div>
  )

  if (!user) return (
    <div className="max-w-[500px] mx-auto px-6 sm:px-8 py-28 text-center animate-fade-in">
      <p className="font-display text-[26px] font-light text-[#1A2E24] mb-3">Sign in required</p>
      <p className="text-[13px] text-[#7A7067] mb-10 font-light">Please sign in to view your orders.</p>
      <Link to="/login" className="btn-primary">Sign in</Link>
    </div>
  )

  return (
    <div className="max-w-[760px] mx-auto px-6 sm:px-8 lg:px-12 py-12 animate-fade-in">
      <div className="mb-12">
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#2D6A4F] mb-3">Account</p>
        <h1 className="font-display text-[36px] font-light text-[#1A2E24]">My Orders</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 border border-[#E0D8CE]">
          <div className="w-12 h-12 border border-[#E0D8CE] flex items-center justify-center mx-auto mb-6">
            <svg className="w-5 h-5 text-[#C8BFB3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
          </div>
          <p className="font-display text-[22px] font-light text-[#7A7067] mb-2">No orders yet</p>
          <p className="text-[13px] text-[#C8BFB3] mb-10">When you place an order, it will appear here.</p>
          <Link to="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(order => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block border border-[#E0D8CE] bg-[#FAF9F7] hover:border-[#2D6A4F] hover:bg-[#FAF7F2] transition-all duration-200 p-6 group"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-[13px] font-medium text-[#1A2E24] group-hover:text-[#2D6A4F] transition-colors">
                    {order.order_number}
                  </p>
                  <p className="text-[11px] text-[#7A7067] mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#7A7067]">
                <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                <span className="text-[#2D6A4F] font-medium">৳{order.total_amount.toLocaleString()}</span>
                <AdvanceStatusBadge status={order.advance_payment_status} />
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}
