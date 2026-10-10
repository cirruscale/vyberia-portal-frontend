import { useEffect, useState } from 'react'
import { ProductCard } from '@/components/product/ProductCard'
import { products as productsApi } from '@/lib/api/products'
import type { Product } from '@/lib/types'

const INITIAL_SHOW = 6
const PAGE_SIZE = 12

export default function HomePage() {
  const [trending, setTrending] = useState<Product[]>([])
  const [others, setOthers] = useState<Product[]>([])
  const [visibleCount, setVisibleCount] = useState(INITIAL_SHOW)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingTrending, setLoadingTrending] = useState(true)
  const [loadingOthers, setLoadingOthers] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Load 6 trending products
  useEffect(() => {
    productsApi.trending(6)
      .then(r => { if (r.data) setTrending(r.data) })
      .finally(() => setLoadingTrending(false))
  }, [])

  // Load first page of all products for the "others" section
  useEffect(() => {
    productsApi.list({ page: 1, page_size: PAGE_SIZE })
      .then(r => {
        if (r.data) {
          setOthers(r.data.items)
          setHasMore(r.data.total > PAGE_SIZE)
          setPage(1)
        }
      })
      .finally(() => setLoadingOthers(false))
  }, [])

  const handleSeeMore = async () => {
    if (visibleCount < others.length) {
      // Expand already-loaded items first
      setVisibleCount(others.length)
      return
    }
    // Need to fetch next page
    setLoadingMore(true)
    const nextPage = page + 1
    try {
      const r = await productsApi.list({ page: nextPage, limit: PAGE_SIZE })
      if (r.data) {
        const combined = [...others, ...r.data.items]
        setOthers(combined)
        setVisibleCount(combined.length)
        setHasMore(combined.length < r.data.total)
        setPage(nextPage)
      }
    } finally {
      setLoadingMore(false)
    }
  }

  const visibleOthers = others.slice(0, visibleCount)
  const canSeeMore = visibleCount < others.length || hasMore

  return (
    <div className="space-y-10">
      {/* ── Trending Now ── */}
      <section>
        {loadingTrending ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-lg aspect-square" />
            ))}
          </div>
        ) : trending.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {trending.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="text-gray-500">No trending products yet.</p>
        )}
      </section>

      {/* ── All Products ── */}
      <section>
        {loadingOthers ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-lg aspect-square" />
            ))}
          </div>
        ) : visibleOthers.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" style={{ zoom: 0.95 }}>
              {visibleOthers.map(p => <ProductCard key={p.id} product={p} />)}
            </div>

            {canSeeMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleSeeMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-brand text-brand font-semibold text-sm hover:bg-brand hover:text-white transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      See more
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : null}
      </section>
    </div>
  )
}
