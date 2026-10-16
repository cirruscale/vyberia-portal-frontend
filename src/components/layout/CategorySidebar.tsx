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
          className={`flex-1 py-2 text-[13px] transition-colors ${
            isActive ? 'text-dark font-medium' : 'text-[#888] hover:text-dark'
          }`}
        >
          {cat.name}
        </Link>
        {hasSubs && (
          <button
            onClick={() => setOpen(o => !o)}
            className="p-1.5 text-[#ccc] hover:text-[#888] transition-colors cursor-pointer"
          >
            <svg className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
      {hasSubs && open && (
        <div className="ml-3 pl-3 border-l border-[#eee]">
          {cat.subcategories!.map(sub => (
            <Link
              key={sub.id}
              to={`/products?subcategory_id=${sub.id}`}
              className={`block py-1.5 text-[12px] transition-colors ${
                activeSubId === sub.id ? 'text-dark font-medium' : 'text-[#aaa] hover:text-dark'
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
    <aside className="hidden md:block w-48 flex-shrink-0 animate-slide-in-right">
      <div className="sticky top-[76px]">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#aaa] mb-4">Categories</h3>
        <nav className="space-y-0.5">
          <Link
            to="/products"
            className={`block py-2 text-[13px] transition-colors ${
              allActive ? 'text-dark font-medium' : 'text-[#888] hover:text-dark'
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
