import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCmsAuth } from '@/lib/context/CmsAuthContext'
import { cmsDashboard } from '@/lib/api/cms'
import { OrderStatusBadge } from '@/components/ui/Badge'
import type { DashboardStats } from '@/lib/types'

function StatCard({ label, value, sub, color, bg }: { label: string; value: string | number; sub?: string; color?: string; bg?: string }) {
  return (
    <div className="rounded-lg p-3 shadow-sm border border-slate-100" style={{ background: bg ?? '#ffffff' }}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{label}</p>
      <p className="text-xl font-bold mt-1 leading-tight" style={{ color: color ?? '#0F172A' }}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
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
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C4A87A', borderTopColor: 'transparent' }} />
    </div>
  )

  if (!stats) return null

  return (
    <div className="flex flex-col h-full overflow-hidden px-5 py-4 gap-3">

      {/* Header */}
      <div className="flex-shrink-0">
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-xs mt-0.5">Welcome back, {user?.name}</p>
      </div>

      {/* Financials */}
      <div className="flex-shrink-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Financials</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg p-3 shadow-sm text-white" style={{ background: '#C4A87A' }}>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#F5EDE0' }}>Total Revenue</p>
            <p className="text-xl font-bold mt-1">৳{stats.financials.total_revenue.toLocaleString()}</p>
          </div>
          <StatCard label="Advance Collected" value={`৳${stats.financials.total_advance_collected.toLocaleString()}`} color="#16A34A" />
          <StatCard label="Due Amount" value={`৳${stats.financials.total_due_amount.toLocaleString()}`} color="#DC2626" />
        </div>
      </div>

      {/* Orders */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Orders</p>
          <Link to="/cms/orders" className="text-xs text-brand hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {[
            { label: 'Total', value: stats.orders.total, color: '#0F172A' },
            { label: 'Pending', value: stats.orders.pending, color: '#D97706' },
            { label: 'Processing', value: stats.orders.processing, color: '#2563EB' },
            { label: 'Shipped', value: stats.orders.shipped, color: '#7C3AED' },
            { label: 'Delivered', value: stats.orders.delivered, color: '#16A34A' },
            { label: 'Cancelled', value: stats.orders.cancelled, color: '#DC2626' },
          ].map(s => <StatCard key={s.label} label={s.label} value={s.value} color={s.color} />)}
        </div>
      </div>

      {/* Products + Users */}
      <div className="flex-shrink-0 grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Products</p>
            <Link to="/cms/products" className="text-xs text-brand hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <StatCard label="Total" value={stats.products.total} />
            <StatCard label="Active" value={stats.products.active} color="#16A34A" />
            <StatCard label="Low Stock" value={stats.products.low_stock} sub="< 5 units" color="#DC2626" />
            <StatCard label="Trending" value={stats.products.trending} color="#7C3AED" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Users</p>
            <Link to="/cms/users" className="text-xs text-brand hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <StatCard label="Total" value={stats.users.total} />
            <StatCard label="Customers" value={stats.users.customer} color="#2563EB" />
            <StatCard label="Merchants" value={stats.users.merchant} color="#D97706" />
            <StatCard label="Staff" value={stats.users.admin + stats.users.operator} color="#16A34A" />
          </div>
        </div>
      </div>

      {/* Recent Orders — fills remaining space */}
      {stats.recent_orders?.length > 0 && (
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Recent Orders</p>
            <Link to="/cms/orders" className="text-xs text-brand hover:underline">View all →</Link>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex-1 min-h-0">
            <table className="w-full text-sm">
              <thead style={{ background: '#F8FAFC' }}>
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Order #</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Customer</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Status</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recent_orders.slice(0, 4).map(o => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{o.order_number}</td>
                    <td className="px-4 py-2.5 text-slate-700">{o.shipping_address?.full_name ?? '—'}</td>
                    <td className="px-4 py-2.5"><OrderStatusBadge status={o.status} /></td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-900">৳{o.total_amount.toLocaleString()}</td>
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
