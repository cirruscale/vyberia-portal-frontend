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
    <div className="border-b border-[#E0D8CE]/60 last:border-0">
      <div className="flex items-center">
        <Link
          to={`/products?category_id=${cat.id}`}
          className={`flex-1 py-3.5 text-[12px] tracking-[0.06em] uppercase transition-colors ${
            isActive
              ? 'text-[#B8956A] font-medium'
              : 'text-[#0C0B0A] hover:text-[#B8956A] font-normal'
          }`}
        >
          {cat.name}
        </Link>
        {isActive && <span className="w-1 h-1 rounded-full bg-[#B8956A] mr-1" />}
        {hasSubs && (
          <button
            onClick={() => setOpen(o => !o)}
            className="p-1.5 text-[#C8BFB3] hover:text-[#B8956A] transition-colors cursor-pointer"
          >
            <svg
              className={`w-2.5 h-2.5 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
      {hasSubs && open && (
        <div className="ml-3 mb-2">
          {cat.subcategories!.map(sub => (
            <Link
              key={sub.id}
              to={`/products?subcategory_id=${sub.id}`}
              className={`flex items-center gap-2 py-2 text-[11px] tracking-[0.04em] transition-colors ${
                activeSubId === sub.id
                  ? 'text-[#B8956A] font-medium'
                  : 'text-[#7A7067] hover:text-[#0C0B0A]'
              }`}
            >
              <span className={`w-1 h-1 rounded-full flex-shrink-0 ${activeSubId === sub.id ? 'bg-[#B8956A]' : 'bg-[#C8BFB3]'}`} />
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
    <aside className="hidden md:block w-44 flex-shrink-0 animate-slide-in-right">
      <div className="sticky top-[112px]">
        <p className="text-[9px] font-medium tracking-[0.2em] uppercase text-[#B8956A] mb-5">Browse</p>
        <nav>
          <div className="border-b border-[#E0D8CE]/60">
            <Link
              to="/products"
              className={`block py-3.5 text-[12px] tracking-[0.06em] uppercase transition-colors ${
                allActive ? 'text-[#B8956A] font-medium' : 'text-[#0C0B0A] hover:text-[#B8956A]'
              }`}
            >
              All Products
            </Link>
          </div>
          {cats.map(cat => (
            <CategoryItem key={cat.id} cat={cat} activeCatId={activeCatId} activeSubId={activeSubId} />
          ))}
        </nav>
      </div>
    </aside>
  )
}
