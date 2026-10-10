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
    const filters: ProductFilters = {
      page,
      page_size: 20,
      sort_by: sort_by as ProductFilters['sort_by'],
    }
    if (category_id) filters.category_id = category_id
    if (subcategory_id) filters.subcategory_id = subcategory_id
    if (search) filters.search = search
    try {
      const res = await products.list(filters)
      setItems(res.data?.items ?? [])
      setTotal(res.data?.total ?? 0)
      setTotalPages(res.data?.total_pages ?? 1)
    } finally {
      setLoading(false)
    }
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
    <div className="py-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Products</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          defaultValue={search}
          onKeyDown={e => { if (e.key === 'Enter') setParam('search', (e.target as HTMLInputElement).value) }}
          className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <select
          value={category_id}
          onChange={e => setParam('category_id', e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">All Categories</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={sort_by}
          onChange={e => setParam('sort_by', e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="newest">Newest</option>
          <option value="trending">Trending</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg aspect-square" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          <p className="text-sm text-gray-500 mb-4">{total} products found</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={p => setParam('page', String(p))} />
        </>
      ) : (
        <div className="text-center py-20 text-gray-500">No products found.</div>
      )}
    </div>
  )
}
