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
    const onScroll = () => setScrolled(window.scrollY > 10)
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
      {/* Announcement bar */}
      <div className="announcement-bar overflow-hidden">
        <div className="overflow-hidden">
          <div className="marquee-track whitespace-nowrap">
            {[
              'Free delivery on orders over ৳5,000',
              '\u00a0\u00a0\u00a0\u2014\u00a0\u00a0\u00a0',
              'Secure payment · bKash · Nagad · COD',
              '\u00a0\u00a0\u00a0\u2014\u00a0\u00a0\u00a0',
              'Easy 7-day returns',
              '\u00a0\u00a0\u00a0\u2014\u00a0\u00a0\u00a0',
              'Free delivery on orders over ৳5,000',
              '\u00a0\u00a0\u00a0\u2014\u00a0\u00a0\u00a0',
              'Secure payment · bKash · Nagad · COD',
              '\u00a0\u00a0\u00a0\u2014\u00a0\u00a0\u00a0',
              'Easy 7-day returns',
              '\u00a0\u00a0\u00a0\u2014\u00a0\u00a0\u00a0',
            ].map((t, i) => <span key={i}>{t}</span>)}
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'bg-[#FAF9F7]/95 backdrop-blur-md border-b border-[#E0D8CE]'
            : 'bg-[#FAF9F7] border-b border-transparent'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex items-center h-[68px] relative">

            {/* Left: mobile trigger + desktop logo */}
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 cursor-pointer text-[#0C0B0A] hover:text-[#B8956A] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" d="M4 7h16M4 12h10" />
                </svg>
              </button>
              <Link to="/" className="hidden lg:block">
                <span className="font-display text-[22px] font-light text-[#0C0B0A] uppercase" style={{ letterSpacing: '0.3em' }}>
                  Vyberia
                </span>
              </Link>
            </div>

            {/* Center: mobile logo + desktop nav */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
              {/* Mobile logo */}
              <Link to="/" className="lg:hidden">
                <span className="font-display text-[20px] font-light text-[#0C0B0A] uppercase" style={{ letterSpacing: '0.28em' }}>
                  Vyberia
                </span>
              </Link>
              {/* Desktop nav */}
              <nav className="hidden lg:flex items-center gap-9">
                <Link to="/products?sort_by=newest" className="link-gold text-[11px] font-medium tracking-[0.12em] uppercase text-[#0C0B0A] hover:text-[#B8956A] transition-colors">New Arrivals</Link>
                <Link to="/products?sort_by=trending" className="link-gold text-[11px] font-medium tracking-[0.12em] uppercase text-[#0C0B0A] hover:text-[#B8956A] transition-colors">Trending</Link>
                <Link to="/products" className="link-gold text-[11px] font-medium tracking-[0.12em] uppercase text-[#0C0B0A] hover:text-[#B8956A] transition-colors">Collections</Link>
                <Link to="/products?sort_by=price_asc" className="link-gold text-[11px] font-medium tracking-[0.12em] uppercase text-[#0C0B0A] hover:text-[#B8956A] transition-colors">Shop All</Link>
              </nav>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-0.5 flex-1 justify-end">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 cursor-pointer text-[#0C0B0A] hover:text-[#B8956A] transition-colors"
                title="Search"
              >
                <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>

              <Link to="/cart" className="relative p-2.5 text-[#0C0B0A] hover:text-[#B8956A] transition-colors" title="Cart">
                <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
                {cartCount > 0 && (
                  <span
                    className={`absolute top-1.5 right-1.5 bg-[#B8956A] text-white text-[8px] font-semibold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5 ${bounce ? 'animate-cart-pop' : ''}`}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-2.5 cursor-pointer text-[#0C0B0A] hover:text-[#B8956A] transition-colors"
                  >
                    <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-[#FAF9F7] border border-[#E0D8CE] shadow-[0_12px_40px_rgba(12,11,10,0.1)] animate-scale-in origin-top-right">
                      <div className="px-5 py-4 border-b border-[#E0D8CE]">
                        <p className="text-[13px] font-medium text-[#0C0B0A]">{user.name}</p>
                        <p className="text-[11px] text-[#7A7067] truncate mt-0.5">{user.email || user.phone}</p>
                      </div>
                      <div className="py-1.5">
                        <Link to="/profile" className="block px-5 py-2.5 text-[12px] tracking-[0.04em] text-[#0C0B0A] hover:bg-[#F2EDE5] hover:text-[#B8956A] transition-colors" onClick={() => setMenuOpen(false)}>Profile</Link>
                        <Link to="/orders" className="block px-5 py-2.5 text-[12px] tracking-[0.04em] text-[#0C0B0A] hover:bg-[#F2EDE5] hover:text-[#B8956A] transition-colors" onClick={() => setMenuOpen(false)}>Orders</Link>
                      </div>
                      <div className="border-t border-[#E0D8CE] py-1.5">
                        <button onClick={() => { logout(); setMenuOpen(false) }} className="block w-full text-left px-5 py-2.5 text-[12px] tracking-[0.04em] text-red-500 hover:bg-red-50 transition-colors cursor-pointer">Sign out</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="p-2.5 text-[#0C0B0A] hover:text-[#B8956A] transition-colors">
                  <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Search drawer */}
        {searchOpen && (
          <div className="border-t border-[#E0D8CE] animate-fade-in bg-[#FAF9F7]">
            <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-5">
              <form onSubmit={handleSearch} className="flex items-center gap-4">
                <svg className="w-4 h-4 text-[#B8956A] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search for products, categories..."
                  className="flex-1 text-[14px] bg-transparent border-none outline-none placeholder:text-[#C8BFB3] text-[#0C0B0A]"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="text-[11px] tracking-[0.1em] uppercase text-[#7A7067] hover:text-[#0C0B0A] cursor-pointer transition-colors">Close</button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#2A1F14]/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-full max-w-[340px] bg-[#FAF9F7] animate-slide-in-panel flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E0D8CE]">
              <span className="font-display text-[20px] font-light tracking-[0.25em] uppercase">Vyberia</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 cursor-pointer text-[#0C0B0A] hover:text-[#B8956A] transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 border-b border-[#E0D8CE]">
              <form onSubmit={handleSearch}>
                <div className="flex items-center gap-3 border border-[#E0D8CE] px-4 py-3 bg-[#F2EDE5]">
                  <svg className="w-3.5 h-3.5 text-[#B8956A] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="flex-1 text-[13px] bg-transparent outline-none placeholder:text-[#C8BFB3]"
                  />
                </div>
              </form>
            </div>

            <nav className="flex-1 px-6 py-4 space-y-0.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/products?sort_by=newest', label: 'New Arrivals' },
                { to: '/products?sort_by=trending', label: 'Trending' },
                { to: '/products', label: 'Collections' },
                { to: '/orders', label: 'My Orders' },
              ].map(item => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between py-4 text-[13px] tracking-[0.06em] uppercase text-[#0C0B0A] hover:text-[#B8956A] border-b border-[#E0D8CE]/60 transition-colors"
                >
                  {item.label}
                  <svg className="w-3 h-3 text-[#C8BFB3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </nav>

            <div className="px-6 py-5 border-t border-[#E0D8CE]">
              {user ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-[#0C0B0A]">{user.name}</p>
                    <p className="text-[11px] text-[#7A7067] mt-0.5">{user.email || user.phone}</p>
                  </div>
                  <button onClick={() => { logout(); setMobileOpen(false) }} className="text-[11px] tracking-[0.08em] uppercase text-red-500 cursor-pointer">Sign out</button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-3.5 text-[11px] tracking-[0.1em] uppercase font-medium border border-[#B8956A] text-[#B8956A] hover:bg-[#B8956A] hover:text-[#FAF9F7] transition-colors">Sign in</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-3.5 text-[11px] tracking-[0.1em] uppercase font-medium bg-[#B8956A] text-[#FAF9F7] hover:bg-[#9A7A54] transition-colors">Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
