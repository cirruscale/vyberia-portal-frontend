import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/context/AuthContext'
import { useCart } from '@/lib/context/CartContext'

export function Header() {
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [bounce, setBounce] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => { setBounce(true); setTimeout(() => setBounce(false), 300) }
    window.addEventListener('cart-updated', handler)
    return () => window.removeEventListener('cart-updated', handler)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) { navigate(`/products?search=${encodeURIComponent(search.trim())}`); setSearch('') }
  }

  return (
    <header className="sticky top-0 z-40 bg-dark">
      <div className="px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-lg font-bold text-white tracking-tight">VYBERIA</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-white placeholder-stone-500 focus:outline-none focus:bg-white/15 focus:border-white/20 transition-all"
              />
            </div>
          </form>

          {/* Right */}
          <div className="flex items-center gap-1">
            <Link to="/cart" className="relative p-2 rounded-lg text-stone-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 bg-brand text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 ${bounce ? 'animate-cart-pop' : ''}`}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-md bg-brand text-white flex items-center justify-center text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:block text-sm text-stone-300">{user.name.split(' ')[0]}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl shadow-black/15 border border-stone-100 overflow-hidden animate-slide-up">
                    <div className="px-4 py-3 border-b border-stone-100">
                      <p className="text-sm font-semibold text-stone-900">{user.name}</p>
                      <p className="text-xs text-muted truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors" onClick={() => setMenuOpen(false)}>Profile</Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors" onClick={() => setMenuOpen(false)}>My Orders</Link>
                    </div>
                    <div className="border-t border-stone-100 py-1">
                      <button onClick={() => { logout(); setMenuOpen(false) }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer">Sign out</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link to="/login" className="px-3 py-1.5 text-sm text-stone-400 hover:text-white transition-colors">Sign in</Link>
                <Link to="/register" className="px-4 py-1.5 text-sm text-dark bg-white hover:bg-stone-100 rounded-lg transition-all font-medium">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
