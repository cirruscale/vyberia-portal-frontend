import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/context/AuthContext'
import { useCart } from '@/lib/context/CartContext'

export function Header() {
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [bounce, setBounce] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => { setBounce(true); setTimeout(() => setBounce(false), 300) }
    window.addEventListener('cart-updated', handler)
    return () => window.removeEventListener('cart-updated', handler)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`)
      setSearch('')
      setSearchOpen(false)
      setMobileOpen(false)
    }
  }

  return (
    <>
      <header className={`sticky top-0 z-40 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-[0_1px_0_0_#e5e5e5]' : ''}`}>
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-[60px]">
            {/* Left: Menu + Logo */}
            <div className="flex items-center gap-5">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden -ml-1 p-1 cursor-pointer"
              >
                <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>

              <Link to="/" className="flex items-center">
                <span className="text-[20px] font-semibold tracking-[-0.04em]">VYBERIA</span>
              </Link>

              {/* Desktop nav */}
              <nav className="hidden lg:flex items-center gap-7 ml-8">
                <Link to="/products?sort_by=newest" className="text-[13px] text-[#555] hover:text-dark transition-colors">New Arrivals</Link>
                <Link to="/products?sort_by=trending" className="text-[13px] text-[#555] hover:text-dark transition-colors">Trending</Link>
                <Link to="/products" className="text-[13px] text-[#555] hover:text-dark transition-colors">All Products</Link>
              </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-full hover:bg-[#f5f5f5] transition-colors cursor-pointer"
              >
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>

              {/* Cart */}
              <Link to="/cart" className="relative p-2.5 rounded-full hover:bg-[#f5f5f5] transition-colors">
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
                {cartCount > 0 && (
                  <span className={`absolute top-1 right-1 bg-dark text-white text-[9px] font-medium rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 ${bounce ? 'animate-cart-pop' : ''}`}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User */}
              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-2.5 rounded-full hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                  >
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#eee] overflow-hidden animate-scale-in origin-top-right">
                      <div className="px-4 py-3 border-b border-[#f0f0f0]">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-[11px] text-muted truncate mt-0.5">{user.email || user.phone}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/profile" className="block px-4 py-2 text-[13px] text-[#444] hover:bg-[#fafafa] transition-colors" onClick={() => setMenuOpen(false)}>Profile</Link>
                        <Link to="/orders" className="block px-4 py-2 text-[13px] text-[#444] hover:bg-[#fafafa] transition-colors" onClick={() => setMenuOpen(false)}>Orders</Link>
                      </div>
                      <div className="border-t border-[#f0f0f0] py-1">
                        <button onClick={() => { logout(); setMenuOpen(false) }} className="block w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors cursor-pointer">Sign out</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="p-2.5 rounded-full hover:bg-[#f5f5f5] transition-colors">
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Search drawer */}
        {searchOpen && (
          <div className="border-t border-[#eee] animate-fade-in">
            <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-4">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#999] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search for products..."
                  className="flex-1 text-base bg-transparent border-none outline-none placeholder:text-[#bbb]"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="text-[13px] text-[#999] hover:text-dark cursor-pointer">Cancel</button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-full max-w-[320px] bg-white animate-slide-in-panel flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[#eee]">
              <span className="text-[18px] font-semibold tracking-[-0.04em]">VYBERIA</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-4 py-3 bg-[#f5f5f5] rounded-lg text-sm outline-none placeholder:text-[#aaa]"
                />
              </form>
            </div>

            <nav className="flex-1 px-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/products?sort_by=newest', label: 'New Arrivals' },
                { to: '/products?sort_by=trending', label: 'Trending' },
                { to: '/products', label: 'All Products' },
                { to: '/orders', label: 'Orders' },
              ].map(item => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3.5 text-[15px] text-[#333] hover:bg-[#fafafa] rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="p-5 border-t border-[#eee]">
              {user ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-[11px] text-muted">{user.email || user.phone}</p>
                  </div>
                  <button onClick={() => { logout(); setMobileOpen(false) }} className="text-[13px] text-red-600 cursor-pointer">Sign out</button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-3 text-sm font-medium border border-[#ddd] rounded-lg hover:bg-[#fafafa] transition-colors">Sign in</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-3 text-sm font-medium text-white bg-dark rounded-lg">Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
