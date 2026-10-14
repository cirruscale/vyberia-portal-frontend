import { useEffect, useState } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { categories } from '@/lib/api/categories'
import type { Category } from '@/lib/types'

function CategoryItem({ cat, activeCatId, activeSubId }: { cat: Category; activeCatId: string; activeSubId: string }) {
  const hasSubs = (cat.subcategories?.length ?? 0) > 0
  const isActive = activeCatId === cat.id && !activeSubId
  const subIsActive = cat.subcategories?.some(s => s.id === activeSubId) ?? false
  const [open, setOpen] = useState(subIsActive)

  return (
    <div>
      <div className="flex items-center">
        <Link
          to={`/products?category_id=${cat.id}`}
          className={`flex-1 px-4 py-2 text-[13px] transition-all ${
            isActive
              ? 'text-brand font-semibold bg-brand-light'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          {cat.name}
        </Link>
        {hasSubs && (
          <button
            onClick={() => setOpen(o => !o)}
            className="px-3 py-2 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
          >
            <svg className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
      {hasSubs && open && (
        <div className="ml-4 border-l border-stone-200">
          {cat.subcategories!.map(sub => (
            <Link
              key={sub.id}
              to={`/products?subcategory_id=${sub.id}`}
              className={`block pl-3 pr-4 py-1.5 text-xs transition-all ${
                activeSubId === sub.id
                  ? 'text-brand font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {sub.name}
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

  const allActive = !activeCatId && !activeSubId

  return (
    <aside className="hidden md:block w-52 flex-shrink-0 animate-slide-in-right">
      <div className="sticky top-16">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest px-4 mb-3">Categories</h3>
        <nav>
          <Link
            to="/products"
            className={`flex items-center px-4 py-2 text-[13px] font-medium transition-all ${
              allActive ? 'text-brand bg-brand-light' : 'text-stone-700 hover:text-stone-900 hover:bg-stone-50'
            }`}
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
