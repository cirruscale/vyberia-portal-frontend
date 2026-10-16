import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '@/components/product/ProductCard'
import { products as productsApi } from '@/lib/api/products'
import { categories as categoriesApi } from '@/lib/api/categories'
import type { Product, Category } from '@/lib/types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const PAGE_SIZE = 12

function catImg(url?: string) {
  if (!url) return ''
  return url.startsWith('http') ? url : `${BASE_URL}${url}`
}

function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
      {Array.from({ length: count }).map((_, i) => (
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
  )
}

export default function HomePage() {
  const [trending, setTrending] = useState<Product[]>([])
  const [others, setOthers] = useState<Product[]>([])
  const [cats, setCats] = useState<Category[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingTrending, setLoadingTrending] = useState(true)
  const [loadingOthers, setLoadingOthers] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    productsApi.trending(8)
      .then(r => { if (r.data) setTrending(r.data) })
      .finally(() => setLoadingTrending(false))
    categoriesApi.list()
      .then(r => { if (r.data) setCats(r.data) })
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
  const heroProduct = trending[0]
  const heroImg = heroProduct?.image_url?.startsWith('http')
    ? heroProduct.image_url
    : heroProduct?.image_url ? `${BASE_URL}${heroProduct.image_url}` : ''

  return (
    <div>
      {/* Hero */}
      {heroProduct && !loading && (
        <section className="border-b border-[#eee]">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-16 items-center min-h-[420px] lg:min-h-[560px] py-12 lg:py-0">
              <div className="animate-fade-up">
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted mb-5">Featured</p>
                <h1 className="text-[clamp(32px,5vw,56px)] font-semibold leading-[1.1] tracking-[-0.03em] mb-5">
                  {heroProduct.title}
                </h1>
                <p className="text-[15px] text-[#666] leading-relaxed max-w-[420px] mb-8">
                  {heroProduct.description || 'Discover our curated collection of premium products. Quality craftsmanship meets modern design.'}
                </p>
                <div className="flex items-center gap-5">
                  <Link
                    to={`/products/${heroProduct.slug}`}
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-dark text-white text-[13px] font-medium rounded-full hover:bg-brand transition-colors"
                  >
                    Shop Now
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                    </svg>
                  </Link>
                  <span className="text-[22px] font-semibold tracking-[-0.02em]">৳{heroProduct.price.toLocaleString()}</span>
                </div>
              </div>
              {heroImg && (
                <div className="relative mt-8 lg:mt-0 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                  <div className="aspect-[4/5] lg:aspect-[3/4] rounded-[6px] overflow-hidden bg-[#f5f5f5]">
                    <img src={heroImg} alt={heroProduct.title} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {cats.length > 0 && !loading && (
        <section className="border-b border-[#eee]">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-14">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-[22px] font-semibold tracking-[-0.02em]">Categories</h2>
              <Link to="/products" className="text-[13px] text-muted hover:text-dark transition-colors">View all</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {cats.map((cat, i) => {
                const img = catImg(cat.image_url)
                return (
                  <Link
                    key={cat.id}
                    to={`/products?category_id=${cat.id}`}
                    className="group relative aspect-[4/5] rounded-[4px] overflow-hidden bg-[#f5f5f5] animate-card-enter"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {img && (
                      <img src={img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white text-[14px] font-medium">{cat.name}</p>
                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <p className="text-white/60 text-[11px] mt-0.5">{cat.subcategories.length} subcategories</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        {loading ? (
          <div className="py-14">
            <SkeletonGrid count={8} />
          </div>
        ) : (
          <>
            {/* Trending */}
            {trending.length > 0 && (
              <section className="py-14 border-b border-[#eee]">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h2 className="text-[22px] font-semibold tracking-[-0.02em]">Trending Now</h2>
                    <p className="text-[13px] text-muted mt-1">Most popular this week</p>
                  </div>
                  <Link to="/products?sort_by=trending" className="text-[13px] text-muted hover:text-dark transition-colors hidden sm:block">
                    See all
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
                  {trending.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </div>
              </section>
            )}

            {/* All Products */}
            {others.length > 0 && (
              <section className="py-14">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h2 className="text-[22px] font-semibold tracking-[-0.02em]">All Products</h2>
                    <p className="text-[13px] text-muted mt-1">Browse the full collection</p>
                  </div>
                  <Link to="/products" className="text-[13px] text-muted hover:text-dark transition-colors hidden sm:block">
                    Browse all
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
                  {others.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </div>

                {hasMore && (
                  <div className="mt-14 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="inline-flex items-center gap-2 px-8 py-3 text-[13px] font-medium border border-[#ddd] rounded-full hover:border-dark hover:bg-dark hover:text-white transition-all duration-300 disabled:opacity-50 cursor-pointer"
                    >
                      {loadingMore ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Loading
                        </>
                      ) : 'Load More'}
                    </button>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
