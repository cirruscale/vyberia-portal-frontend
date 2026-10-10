import { useEffect, useState } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { categories } from '@/lib/api/categories'
import type { Category } from '@/lib/types'

const BRAND = '#C4A87A'
const BRAND_DARK = '#9A7A5A'
const BRAND_LIGHT = '#F5EDE0'

function CategoryItem({ cat, activeCatId, activeSubId }: { cat: Category; activeCatId: string; activeSubId: string }) {
  const hasSubs = (cat.subcategories?.length ?? 0) > 0
  const isActive = activeCatId === cat.id && !activeSubId
  const subIsActive = cat.subcategories?.some(s => s.id === activeSubId) ?? false
  const [open, setOpen] = useState(subIsActive)

  return (
    <div>
      <div className="flex items-center border-t border-gray-100">
        <Link
          to={`/products?category_id=${cat.id}`}
          className="flex-1 px-4 py-2.5 text-sm transition-colors"
          style={isActive ? { background: BRAND_LIGHT, color: BRAND_DARK, fontWeight: 600 } : { color: '#374151' }}
          onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = BRAND_LIGHT; (e.currentTarget as HTMLElement).style.color = BRAND_DARK } }}
          onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = '#374151' } }}
        >
          {cat.name}
        </Link>
        {hasSubs && (
          <button
            onClick={() => setOpen(o => !o)}
            className="px-3 py-2.5 text-gray-400 hover:text-gray-700 transition-colors"
            aria-label={open ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {hasSubs && open && (
        <div className="bg-gray-50">
          {cat.subcategories!.map(sub => (
            <Link
              key={sub.id}
              to={`/products?subcategory_id=${sub.id}`}
              className="block pl-7 pr-4 py-2 text-xs border-t border-gray-100 transition-colors"
              style={activeSubId === sub.id ? { color: BRAND_DARK, fontWeight: 600, background: BRAND_LIGHT } : { color: '#4B5563' }}
              onMouseEnter={e => { if (activeSubId !== sub.id) { (e.currentTarget as HTMLElement).style.color = BRAND_DARK; (e.currentTarget as HTMLElement).style.background = BRAND_LIGHT } }}
              onMouseLeave={e => { if (activeSubId !== sub.id) { (e.currentTarget as HTMLElement).style.color = '#4B5563'; (e.currentTarget as HTMLElement).style.background = '' } }}
            >
              ↳ {sub.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function CategorySidebar() {
  const [cats, setCats] = useState<Category[]>([])
  const [searchParams] = useSearchParams()
  const activeCatId = searchParams.get('category_id') ?? ''
  const activeSubId = searchParams.get('subcategory_id') ?? ''
  const { pathname } = useLocation()

  useEffect(() => {
    categories.tree().then(r => { if (r.data) setCats(r.data) })
  }, [pathname])

  const allActive = !activeCatId

  return (
    <aside className="hidden md:block w-52 flex-shrink-0" style={{ zoom: 1.4 }}>
      <div className="bg-white rounded-xl border overflow-hidden sticky top-20" style={{ borderColor: '#D4B88A' }}>
        <div className="px-4 py-3" style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)` }}>
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">Categories</h2>
        </div>
        <nav>
          <Link
            to="/products"
            className="flex items-center px-4 py-2.5 text-sm font-medium transition-colors"
            style={allActive ? { background: BRAND_LIGHT, color: BRAND_DARK } : { color: '#1F2937' }}
            onMouseEnter={e => { if (!allActive) { (e.currentTarget as HTMLElement).style.background = BRAND_LIGHT; (e.currentTarget as HTMLElement).style.color = BRAND_DARK } }}
            onMouseLeave={e => { if (!allActive) { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = '#1F2937' } }}
          >
            All Products
          </Link>
          {cats.map(cat => (
            <CategoryItem key={cat.id} cat={cat} activeCatId={activeCatId} activeSubId={activeSubId} />
          ))}
        </nav>
      </div>
    </aside>
  )
}
