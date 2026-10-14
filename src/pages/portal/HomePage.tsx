import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '@/components/product/ProductCard'
import { products as productsApi } from '@/lib/api/products'
import type { Product } from '@/lib/types'

const PAGE_SIZE = 18

function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-stone-100 overflow-hidden">
          <div className="aspect-square skeleton-shimmer" />
          <div className="p-3 space-y-2.5">
            <div className="h-3 skeleton-shimmer rounded w-1/3" />
            <div className="h-3.5 skeleton-shimmer rounded w-3/4" />
            <div className="h-4 skeleton-shimmer rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const [trending, setTrending] = useState<Product[]>([])
  const [others, setOthers] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingTrending, setLoadingTrending] = useState(true)
  const [loadingOthers, setLoadingOthers] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    productsApi.trending(12)
      .then(r => { if (r.data) setTrending(r.data) })
      .finally(() => setLoadingTrending(false))
  }, [])

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

  const handleLoadMore = async () => {
    setLoadingMore(true)
    const nextPage = page + 1
    try {
      const r = await productsApi.list({ page: nextPage, page_size: PAGE_SIZE })
      if (r.data) {
        const combined = [...others, ...r.data.items]
        setOthers(combined)
        setHasMore(combined.length < r.data.total)
        setPage(nextPage)
      }
    } finally {
      setLoadingMore(false)
    }
  }

  const loading = loadingTrending || loadingOthers

  return (
    <div className="animate-fade-in">
      {loading ? (
        <SkeletonGrid count={10} />
      ) : (
        <>
          {/* Trending */}
          {trending.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
                  <p className="text-sm text-muted mt-1">Most popular picks this week</p>
                </div>
                <Link to="/products?sort_by=trending" className="text-sm font-semibold text-brand hover:text-brand-hover transition-colors hidden sm:block">
                  View all &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {trending.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            </section>
          )}

          {/* All Products */}
          {others.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
                  <p className="text-sm text-muted mt-1">Browse our full collection</p>
                </div>
                <Link to="/products" className="text-sm font-semibold text-brand hover:text-brand-hover transition-colors hidden sm:block">
                  View all &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {others.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>

              {hasMore && (
                <div className="mt-10 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border-2 border-brand text-brand font-semibold text-sm hover:bg-brand hover:text-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
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
                        Load More Products
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              )}
            </section>
          )}

        </>
      )}
    </div>
  )
}
