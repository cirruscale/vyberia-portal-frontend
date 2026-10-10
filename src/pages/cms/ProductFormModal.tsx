import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cmsProducts } from '@/lib/api/products'
import { cmsCategories } from '@/lib/api/categories'
import { cmsUpload } from '@/lib/api/upload'
import type { Product, Category } from '@/lib/types'

interface Props {
  product: Product | null
  onClose: () => void
  onSaved: () => void
}

export default function ProductFormModal({ product, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    title: '',
    sku: '',
    slug: '',
    description: '',
    price: '',
    stock_quantity: '',
    status: 'active',
    category_id: '',
    subcategory_id: '',
    is_trending: false,
    trending_priority: '0',
    image_url: '',
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    cmsCategories.list().then(r => { if (r.data) setCategories(r.data) })
    cmsCategories.listSubcategories().then(r => { if (r.data) setSubcategories(r.data) })
    if (product) {
      setForm({
        title: product.title,
        sku: product.sku,
        slug: product.slug,
        description: product.description,
        price: String(product.price),
        stock_quantity: String(product.stock_quantity),
        status: product.status,
        category_id: product.category_id ?? '',
        subcategory_id: product.subcategory_id ?? '',
        is_trending: product.is_trending,
        trending_priority: String(product.trending_priority),
        image_url: product.image_url ?? '',
      })
    }
  }, [product])

  const filteredSubs = form.category_id ? subcategories.filter(s => s.parent_id === form.category_id) : subcategories

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = {
        title: form.title,
        sku: form.sku,
        slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-'),
        description: form.description,
        price: parseInt(form.price),
        stock_quantity: parseInt(form.stock_quantity),
        status: form.status as 'active' | 'draft' | 'archived',
        category_id: form.category_id || undefined,
        subcategory_id: form.subcategory_id || undefined,
        is_trending: form.is_trending,
        trending_priority: parseInt(form.trending_priority) || 0,
        image_url: form.image_url || undefined,
      }
      if (product) {
        await cmsProducts.update(product.id, data)
      } else {
        await cmsProducts.create(data)
      }
      onSaved()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await cmsUpload.single(file, 'products')
      if (res.data) setForm(prev => ({ ...prev, image_url: res.data!.url }))
    } finally { setUploading(false) }
  }

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">{product ? 'Edit Product' : 'New Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm text-gray-600">Title *</label>
              <input required value={form.title} onChange={f('title')} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">SKU *</label>
              <input required value={form.sku} onChange={f('sku')} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Slug (auto if blank)</label>
              <input value={form.slug} onChange={f('slug')} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Price (৳) *</label>
              <input required type="number" min="0" value={form.price} onChange={f('price')} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Stock Quantity *</label>
              <input required type="number" min="0" value={form.stock_quantity} onChange={f('stock_quantity')} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Status</label>
              <select value={form.status} onChange={f('status')} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Category</label>
              <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value, subcategory_id: '' }))} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option value="">— None —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Subcategory</label>
              <select value={form.subcategory_id} onChange={f('subcategory_id')} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option value="">— None —</option>
                {filteredSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-sm text-gray-600">Image (primary)</label>
              <input value={form.image_url} onChange={f('image_url')} placeholder="https://... or /uploads/..." className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              <label className="mt-1 flex items-center gap-2 cursor-pointer text-xs text-brand hover:underline">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                {uploading ? 'Uploading...' : 'or upload image file'}
              </label>
              {form.image_url && (
                <img src={form.image_url.startsWith('http') ? form.image_url : `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${form.image_url}`} alt="preview" className="mt-2 h-20 w-20 object-cover rounded border border-gray-200" />
              )}
            </div>
            <div className="col-span-2">
              <label className="text-sm text-gray-600">Description</label>
              <textarea value={form.description} onChange={f('description')} rows={3} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="trending" checked={form.is_trending} onChange={e => setForm(p => ({ ...p, is_trending: e.target.checked }))} />
              <label htmlFor="trending" className="text-sm text-gray-600">Mark as Trending</label>
            </div>
            {form.is_trending && (
              <div>
                <label className="text-sm text-gray-600">Trending Priority</label>
                <input type="number" min="0" value={form.trending_priority} onChange={f('trending_priority')} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>{product ? 'Update' : 'Create'} Product</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
