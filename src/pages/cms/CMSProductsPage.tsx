import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCmsAuth } from '@/lib/context/CmsAuthContext'
import { cmsProducts } from '@/lib/api/products'
import { Button } from '@/components/ui/Button'
import { ProductStatusBadge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import type { Product } from '@/lib/types'
import ProductFormModal from './ProductFormModal'

const inputCls = 'border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand'

export default function CMSProductsPage() {
  const { user, loading: authLoading } = useCmsAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) navigate('/cms/login', { replace: true })
  }, [user, authLoading, navigate])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await cmsProducts.list({
        page, page_size: 20,
        ...(search && { name: search }),
        ...(statusFilter && { status: statusFilter as 'active' | 'draft' | 'archived' }),
      })
      setItems(res.data?.items ?? [])
      setTotal(res.data?.total ?? 0)
      setTotalPages(res.data?.total_pages ?? 1)
    } finally { setLoading(false) }
  }, [page, search, statusFilter])

  useEffect(() => { if (user) load() }, [user, load])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    setDeleting(id)
    try { await cmsProducts.delete(id); load() } finally { setDeleting(null) }
  }

  const handleSaved = () => { setShowForm(false); setEditProduct(null); load() }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} total products</p>
        </div>
        <Button onClick={() => { setEditProduct(null); setShowForm(true) }}>+ Add Product</Button>
      </div>

      <div className="flex gap-3 mb-5">
        <input
          type="text" placeholder="Search products..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className={`flex-1 ${inputCls}`}
        />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className={inputCls}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#C4A87A', borderTopColor: 'transparent' }} />
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No products found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ background: '#F8FAFC' }}>
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500">Product</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500">SKU</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500">Price</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500">Stock</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {p.image_url && (
                        <img
                          src={p.image_url.startsWith('http') ? p.image_url : `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${p.image_url}`}
                          alt={p.title}
                          className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-slate-100"
                        />
                      )}
                      <div>
                        <p className="font-medium text-slate-900 line-clamp-1">{p.title}</p>
                        {p.is_trending && <span className="text-xs text-brand font-medium">Trending</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{p.sku}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-800">৳{p.price.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`font-semibold ${p.stock_quantity < 5 ? 'text-red-600' : 'text-slate-700'}`}>{p.stock_quantity}</span>
                  </td>
                  <td className="px-5 py-3.5"><ProductStatusBadge status={p.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => { setEditProduct(p); setShowForm(true) }} className="text-xs font-medium text-brand hover:text-brand-dark transition-colors">Edit</button>
                      <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {showForm && (
        <ProductFormModal
          product={editProduct}
          onClose={() => { setShowForm(false); setEditProduct(null) }}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
