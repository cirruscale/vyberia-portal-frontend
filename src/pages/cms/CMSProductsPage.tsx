import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCmsAuth } from '@/lib/context/CmsAuthContext'
import { cmsProducts } from '@/lib/api/products'
import { Button } from '@/components/ui/Button'
import { ProductStatusBadge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import type { Product } from '@/lib/types'
import ProductFormModal from './ProductFormModal'

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
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products ({total})</h1>
        <Button onClick={() => { setEditProduct(null); setShowForm(true) }}>+ Add Product</Button>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="text" placeholder="Search products..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="border border-gray-300 rounded-md px-4 py-2 text-sm">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No products found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Product</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">SKU</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Price</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 line-clamp-1">{p.title}</div>
                    {p.is_trending && <span className="text-xs text-indigo-600">🔥 Trending</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                  <td className="px-4 py-3 text-right">৳{p.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={p.stock_quantity < 5 ? 'text-red-600 font-medium' : ''}>{p.stock_quantity}</span>
                  </td>
                  <td className="px-4 py-3"><ProductStatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditProduct(p); setShowForm(true) }} className="text-indigo-600 hover:underline text-xs">Edit</button>
                      <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="text-red-600 hover:underline text-xs">Delete</button>
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
