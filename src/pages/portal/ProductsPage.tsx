import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ProductCard } from '@/components/product/ProductCard'
import { Pagination } from '@/components/ui/Pagination'
import { products, type ProductFilters } from '@/lib/api/products'
import { categories } from '@/lib/api/categories'
import type { Product, Category } from '@/lib/types'

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

  const activeCat = cats.find(c => c.id === category_id)

  return (
    <div className="animate-fade-in">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text" placeholder="Search..." defaultValue={search}
            onKeyDown={e => { if (e.key === 'Enter') setParam('search', (e.target as HTMLInputElement).value) }}
            className="w-full pl-10 pr-4 py-2.5 border border-[#ddd] rounded-[3px] text-[13px] bg-white outline-none focus:border-dark transition-colors"
          />
        </div>
        <select value={category_id} onChange={e => setParam('category_id', e.target.value)} className="border border-[#ddd] rounded-[3px] px-3.5 py-2.5 text-[13px] bg-white outline-none focus:border-dark transition-colors cursor-pointer">
          <option value="">All Categories</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={sort_by} onChange={e => setParam('sort_by', e.target.value)} className="border border-[#ddd] rounded-[3px] px-3.5 py-2.5 text-[13px] bg-white outline-none focus:border-dark transition-colors cursor-pointer">
          <option value="newest">Newest</option>
          <option value="trending">Trending</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Active filters */}
      {(search || activeCat) && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {search && (
            <button onClick={() => setParam('search', '')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f5f5] text-[12px] text-[#555] rounded-full hover:bg-[#eee] transition-colors cursor-pointer">
              "{search}" <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
          {activeCat && (
            <button onClick={() => setParam('category_id', '')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f5f5] text-[12px] text-[#555] rounded-full hover:bg-[#eee] transition-colors cursor-pointer">
              {activeCat.name} <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[3/4] skeleton-shimmer rounded-[4px] mb-3.5" />
              <div className="space-y-2">
                <div className="h-2.5 skeleton-shimmer rounded w-1/3" />
                <div className="h-3 skeleton-shimmer rounded w-2/3" />
                <div className="h-3 skeleton-shimmer rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          <p className="text-[12px] text-muted mb-6">{total} product{total !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={p => setParam('page', String(p))} />
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted text-[14px]">No products found.</p>
          <p className="text-[13px] text-[#bbb] mt-1">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  )
}
