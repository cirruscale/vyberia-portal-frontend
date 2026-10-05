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
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-700">
        <Link to="/cms/dashboard" className="text-xl font-bold text-indigo-400">
          Vyberia CMS
        </Link>
        {user && (
          <p className="text-xs text-gray-400 mt-1">
            {user.name} · {user.role}
          </p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map(item => (
          <Link
            key={item.href}
            to={item.href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
              location.pathname.startsWith(item.href)
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <Link to="/" className="block text-xs text-gray-400 hover:text-gray-200 mb-2">
          ← Back to Portal
        </Link>
        <button
          onClick={logout}
          className="w-full text-left text-sm text-red-400 hover:text-red-300"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
