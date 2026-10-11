import { Link, useLocation } from 'react-router-dom'
import { useCmsAuth } from '@/lib/context/CmsAuthContext'

const nav = [
  { label: 'Dashboard', href: '/cms/dashboard', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
  )},
  { label: 'Products', href: '/cms/products', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
  )},
  { label: 'Categories', href: '/cms/categories', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
  )},
  { label: 'Orders', href: '/cms/orders', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
  )},
  { label: 'Users', href: '/cms/users', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
  )},
]

interface Props {
  collapsed: boolean
  onToggle: () => void
}

export function CMSSidebar({ collapsed, onToggle }: Props) {
  const { pathname } = useLocation()
  const { user, logout } = useCmsAuth()

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? 'A'

  return (
    <aside
      className="sticky top-0 flex-shrink-0 flex flex-col z-40 border-r border-slate-200 bg-white transition-all duration-300"
      style={{ width: collapsed ? '4rem' : '18rem', height: '100vh', overflow: 'hidden', position: 'relative', flexShrink: 0 }}
    >
      {/* Logo + Toggle */}
      <div className="px-3 pt-5 pb-4 border-b border-slate-100 flex items-center gap-2 relative">
        <Link to="/cms/dashboard" className={`flex items-center gap-2.5 min-w-0 ${collapsed ? 'mx-auto' : ''}`}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#C4A87A' }}>
            <span className="text-white text-xs font-bold">V</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-slate-900 text-sm font-bold leading-tight">Vyberia</p>
              <p className="text-xs font-medium" style={{ color: '#C4A87A' }}>CMS Panel</p>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto flex-shrink-0 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Collapse sidebar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {collapsed && (
          <button
            onClick={onToggle}
            className="mx-auto p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Expand sidebar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* User */}
      {user && (
        <div className={`border-b border-slate-100 ${collapsed ? 'py-3 flex justify-center' : 'px-5 py-3'}`}>
          {collapsed ? (
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#F5EDE0' }} title={user.name}>
              <span className="text-xs font-bold" style={{ color: '#9A7A5A' }}>{initials}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#F5EDE0' }}>
                <span className="text-xs font-bold" style={{ color: '#9A7A5A' }}>{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-slate-800 text-xs font-semibold truncate">{user.name}</p>
                <p className="text-slate-400 text-xs capitalize">{user.role}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nav — padded at bottom so content isn't hidden behind the pinned footer */}
      <nav className={`flex-1 py-4 pb-28 space-y-0.5 overflow-y-auto ${collapsed ? 'px-1' : 'px-3'}`}>
        {!collapsed && (
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider px-3 mb-2">Menu</p>
        )}
        {nav.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              to={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center rounded-lg text-sm font-medium transition-all ${
                collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
              }`}
              style={active ? { background: '#F5EDE0', color: '#9A7A5A' } : { color: '#64748B' }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = '#F8FAFC'; (e.currentTarget as HTMLElement).style.color = '#1E293B' } }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = '#64748B' } }}
            >
              <span style={active ? { color: '#9A7A5A' } : { color: '#94A3B8' }}>{item.icon}</span>
              {!collapsed && item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer — absolutely pinned to bottom */}
      <div
        className={`absolute bottom-0 left-0 right-0 py-4 border-t border-slate-100 space-y-0.5 bg-white ${collapsed ? 'px-1' : 'px-3'}`}
      >
        <Link
          to="/"
          title={collapsed ? 'Back to Portal' : undefined}
          className={`flex items-center rounded-lg text-sm transition-all ${
            collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
          }`}
          style={{ color: '#64748B' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F8FAFC'; (e.currentTarget as HTMLElement).style.color = '#1E293B' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = '#64748B' }}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {!collapsed && 'Back to Portal'}
        </Link>
        <button
          onClick={logout}
          title={collapsed ? 'Sign out' : undefined}
          className={`w-full flex items-center rounded-lg text-sm transition-all ${
            collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
          }`}
          style={{ color: '#EF4444' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          {!collapsed && 'Sign out'}
        </button>
      </div>
    </aside>
  )
}
