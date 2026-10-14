import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ProductCard } from '@/components/product/ProductCard'
import { Pagination } from '@/components/ui/Pagination'
import { products, type ProductFilters } from '@/lib/api/products'
import { categories } from '@/lib/api/categories'
import type { Product, Category } from '@/lib/types'

const selectClass = 'border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all'

export default function ProductsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [items, setItems] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [cats, setCats] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const page = Number(searchParams.get('page') || 1)
  const category_id = searchParams.get('category_id') || ''
  const subcategory_id = searchParams.get('subcategory_id') || ''
  const search = searchParams.get('search') || ''
  const sort_by = searchParams.get('sort_by') || 'newest'

  const load = useCallback(async () => {
    setLoading(true)
    const filters: ProductFilters = { page, page_size: 20, sort_by: sort_by as ProductFilters['sort_by'] }
    if (category_id) filters.category_id = category_id
    if (subcategory_id) filters.subcategory_id = subcategory_id
    if (search) filters.search = search
    try {
      const res = await products.list(filters)
      setItems(res.data?.items ?? []); setTotal(res.data?.total ?? 0); setTotalPages(res.data?.total_pages ?? 1)
    } finally { setLoading(false) }
  }, [page, category_id, subcategory_id, search, sort_by])

  useEffect(() => { load() }, [load])
  useEffect(() => { categories.list().then(r => { if (r.data) setCats(r.data) }) }, [])

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString())
    if (value) p.set(key, value); else p.delete(key)
    p.delete('page')
    navigate(`/products?${p.toString()}`)
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" placeholder="Search..." defaultValue={search}
            onKeyDown={e => { if (e.key === 'Enter') setParam('search', (e.target as HTMLInputElement).value) }}
            className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
          />
        </div>
        <select value={category_id} onChange={e => setParam('category_id', e.target.value)} className={selectClass}>
          <option value="">All Categories</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={sort_by} onChange={e => setParam('sort_by', e.target.value)} className={selectClass}>
          <option value="newest">Newest</option>
          <option value="trending">Trending</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden border border-stone-100">
              <div className="aspect-square skeleton-shimmer" />
              <div className="p-3 space-y-2.5">
                <div className="h-3 skeleton-shimmer rounded w-1/3" />
                <div className="h-3 skeleton-shimmer rounded w-3/4" />
                <div className="h-4 skeleton-shimmer rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          <p className="text-xs text-muted mb-4">{total} products</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={p => setParam('page', String(p))} />
        </>
      ) : (
        <div className="text-center py-20 text-muted text-sm">No products found.</div>
      )}
    </div>
  )
}
