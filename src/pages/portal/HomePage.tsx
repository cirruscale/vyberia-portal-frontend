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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="aspect-[3/4] skeleton-shimmer mb-4" />
          <div className="space-y-2.5">
            <div className="h-2 skeleton-shimmer rounded w-1/4" />
            <div className="h-2.5 skeleton-shimmer rounded w-3/5" />
            <div className="h-2.5 skeleton-shimmer rounded w-1/4" />
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
    <div className="bg-[#FAF9F7]">

      {/* ── HERO ── */}
      {heroProduct && !loading && (
        <section className="relative overflow-hidden border-b border-[#E0D8CE]">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center min-h-[520px] lg:min-h-[680px] gap-0 lg:gap-20">

              {/* Text */}
              <div className="py-16 lg:py-0 animate-fade-up">
                <p className="text-[9px] tracking-[0.25em] uppercase text-[#065084] mb-6 font-medium">
                  Featured Collection
                </p>
                <h1 className="font-display text-[clamp(42px,6vw,78px)] font-light leading-[1.05] tracking-[-0.01em] text-[#0C0B0A] mb-7">
                  {heroProduct.title}
                </h1>
                <p className="text-[14px] text-[#7A7067] leading-relaxed max-w-[400px] mb-10 font-light">
                  {heroProduct.description || 'Discover curated pieces for the discerning eye. Where craftsmanship meets modern living.'}
                </p>
                <div className="flex items-center gap-6">
                  <Link
                    to={`/products/${heroProduct.slug}`}
                    className="btn-primary"
                  >
                    Shop Now
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                    </svg>
                  </Link>
                  <div>
                    <p className="text-[9px] tracking-[0.1em] uppercase text-[#065084] mb-1">From</p>
                    <p className="text-[22px] font-display font-light tracking-[-0.01em] text-[#0C0B0A]">৳{heroProduct.price.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Image */}
              {heroImg && (
                <div
                  className="relative animate-fade-in lg:h-[680px]"
                  style={{ animationDelay: '300ms', animationFillMode: 'both' }}
                >
                  <div className="aspect-[3/4] lg:aspect-auto lg:h-full overflow-hidden bg-[#F2EDE5]">
                    <img src={heroImg} alt={heroProduct.title} className="w-full h-full object-cover" />
                  </div>
                  {/* gold corner accent */}
                  <div className="absolute top-6 right-6 w-12 h-12 border-t border-r border-[#065084]/40 pointer-events-none" />
                  <div className="absolute bottom-6 left-6 w-12 h-12 border-b border-l border-[#065084]/40 pointer-events-none" />
                </div>
              )}
            </div>
          </div>
        </section>
      )}


      {/* ── CATEGORIES ── */}
      {cats.length > 0 && !loading && (
        <section className="border-b border-[#E0D8CE]">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-20">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase text-[#065084] mb-3">Explore</p>
                <h2 className="font-display text-[36px] sm:text-[44px] font-light tracking-[-0.01em] text-[#0C0B0A]">
                  Collections
                </h2>
              </div>
              <Link to="/products" className="link-gold text-[11px] tracking-[0.1em] uppercase text-[#7A7067] hover:text-[#0C0B0A] transition-colors">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {cats.map((cat, i) => {
                const img = catImg(cat.image_url)
                return (
                  <Link
                    key={cat.id}
                    to={`/products?category_id=${cat.id}`}
                    className="group relative aspect-[3/4] overflow-hidden bg-[#F2EDE5] animate-card-enter"
                    style={{ animationDelay: `${i * 70}ms` }}
                  >
                    {img && (
                      <img
                        src={img}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                      />
                    )}
                    {/* Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0C0B0A]/70 via-[#0C0B0A]/10 to-transparent" />
                    {/* Gold corner */}
                    <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-[#065084]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="font-display text-[16px] text-[#FAF9F7] font-light leading-tight">{cat.name}</p>
                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <p className="text-[9px] tracking-[0.1em] uppercase text-[#C8E6D4]/70 mt-1.5">{cat.subcategories.length} styles</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CONTENT ── */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        {loading ? (
          <div className="py-20">
            <SkeletonGrid count={8} />
          </div>
        ) : (
          <>
            {/* Trending */}
            {trending.length > 0 && (
              <section className="py-20 border-b border-[#E0D8CE]">
                <div className="flex items-end justify-between mb-12">
                  <div>
                    <p className="text-[9px] tracking-[0.2em] uppercase text-[#065084] mb-3">Most Wanted</p>
                    <h2 className="font-display text-[36px] sm:text-[44px] font-light tracking-[-0.01em] text-[#0C0B0A]">
                      Trending Now
                    </h2>
                  </div>
                  <Link to="/products?sort_by=trending" className="link-gold text-[11px] tracking-[0.1em] uppercase text-[#7A7067] hover:text-[#0C0B0A] transition-colors hidden sm:block">
                    See all
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                  {trending.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </div>
              </section>
            )}

            {/* Editorial banner */}
            {!loading && (
              <section className="py-20 border-b border-[#E0D8CE]">
                <div className="bg-[#E8F4EE] px-10 py-16 sm:px-16 sm:py-20 relative overflow-hidden border border-[#E0D8CE]">
                  <div className="absolute top-6 left-6 w-16 h-16 border-t border-l border-[#065084]/40" />
                  <div className="absolute bottom-6 right-6 w-16 h-16 border-b border-r border-[#065084]/40" />
                  <div className="max-w-[520px]">
                    <p className="text-[9px] tracking-[0.25em] uppercase text-[#065084] mb-5">The Vyberia Standard</p>
                    <h3 className="font-display text-[32px] sm:text-[46px] font-light text-[#1A2E24] leading-tight mb-7">
                      Crafted for those who appreciate the finer things.
                    </h3>
                    <Link to="/products" className="inline-flex items-center gap-3 text-[11px] tracking-[0.12em] uppercase font-medium text-[#065084] hover:text-[#1B4332] transition-colors">
                      Explore Collection
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* All Products */}
            {others.length > 0 && (
              <section className="py-20">
                <div className="flex items-end justify-between mb-12">
                  <div>
                    <p className="text-[9px] tracking-[0.2em] uppercase text-[#065084] mb-3">Complete Range</p>
                    <h2 className="font-display text-[36px] sm:text-[44px] font-light tracking-[-0.01em] text-[#0C0B0A]">
                      All Products
                    </h2>
                  </div>
                  <Link to="/products" className="link-gold text-[11px] tracking-[0.1em] uppercase text-[#7A7067] hover:text-[#0C0B0A] transition-colors hidden sm:block">
                    Browse all
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                  {others.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </div>

                {hasMore && (
                  <div className="mt-16 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="btn-secondary disabled:opacity-40"
                    >
                      {loadingMore ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
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
