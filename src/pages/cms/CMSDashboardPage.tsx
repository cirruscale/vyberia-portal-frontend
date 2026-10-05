import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCmsAuth } from '@/lib/context/CmsAuthContext'
import { cmsDashboard } from '@/lib/api/cms'
import { OrderStatusBadge } from '@/components/ui/Badge'
import type { DashboardStats } from '@/lib/types'

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function CMSDashboardPage() {
  const { user, loading: authLoading } = useCmsAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) { navigate('/cms/login', { replace: true }); return }
    if (user) {
      cmsDashboard.get().then(r => { if (r.data) setStats(r.data) }).finally(() => setLoading(false))
    }
  }, [user, authLoading, navigate])

  if (authLoading || loading) return (
    <div className="p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-24" />)}
      </div>
    </div>
  )

  if (!stats) return null

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Financials</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Revenue" value={`৳${stats.financials.total_revenue.toLocaleString()}`} />
        <StatCard label="Advance Collected" value={`৳${stats.financials.total_advance_collected.toLocaleString()}`} />
        <StatCard label="Due Amount" value={`৳${stats.financials.total_due_amount.toLocaleString()}`} />
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Orders</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          ['Total', stats.orders.total],
          ['Pending', stats.orders.pending],
          ['Processing', stats.orders.processing],
          ['Shipped', stats.orders.shipped],
          ['Delivered', stats.orders.delivered],
          ['Cancelled', stats.orders.cancelled],
        ].map(([label, value]) => (
          <StatCard key={label} label={String(label)} value={Number(value)} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Products</h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Total" value={stats.products.total} />
            <StatCard label="Active" value={stats.products.active} />
            <StatCard label="Low Stock" value={stats.products.low_stock} sub="< 5 units" />
            <StatCard label="Trending" value={stats.products.trending} />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Users</h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Total" value={stats.users.total} />
            <StatCard label="Customers" value={stats.users.customer} />
            <StatCard label="Merchants" value={stats.users.merchant} />
            <StatCard label="Staff" value={stats.users.admin + stats.users.operator} />
          </div>
        </div>
      </div>

      {stats.recent_orders?.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Orders</h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Order #</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recent_orders.slice(0, 5).map(o => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{o.order_number}</td>
                    <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-right">৳{o.total_amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
