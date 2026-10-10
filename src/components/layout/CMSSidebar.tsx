import { Link, useLocation } from 'react-router-dom'
import { useCmsAuth } from '@/lib/context/CmsAuthContext'
import { clsx } from 'clsx'

const nav = [
  { label: 'Dashboard', href: '/cms/dashboard', icon: '📊' },
  { label: 'Products', href: '/cms/products', icon: '📦' },
  { label: 'Categories', href: '/cms/categories', icon: '🗂️' },
  { label: 'Orders', href: '/cms/orders', icon: '🛒' },
  { label: 'Users', href: '/cms/users', icon: '👥' },
]

export function CMSSidebar() {
  const location = useLocation()
  const { user, logout } = useCmsAuth()

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-gray-950 text-white flex flex-col z-40">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-800">
        <Link to="/cms/dashboard">
          <p className="text-base font-bold text-white tracking-wide">Vyberia CMS</p>
        </Link>
        {user && (
          <p className="text-xs text-gray-400 mt-1 truncate">
            {user.name} · <span className="capitalize">{user.role}</span>
          </p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(item => {
          const active = location.pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              to={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          <span className="text-base">←</span>
          Back to Portal
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all"
        >
          <span className="text-base">⏻</span>
          Sign out
        </button>
      </div>
    </aside>
  )
}
