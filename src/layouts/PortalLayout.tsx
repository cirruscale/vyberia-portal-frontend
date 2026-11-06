import { Outlet, useLocation, Link } from 'react-router-dom'
import { AuthProvider } from '../lib/context/AuthContext'
import { CartProvider } from '../lib/context/CartContext'
import { Header } from '../components/layout/Header'
import { CategorySidebar } from '../components/layout/CategorySidebar'

export default function PortalLayout() {
  const { pathname } = useLocation()
  const showSidebar = pathname === '/' || pathname === '/products'

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-[#FAF9F7]">
          <Header />
          {showSidebar ? (
            <div className="flex-1 flex w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-10 gap-12">
              <CategorySidebar />
              <main className="flex-1 min-w-0">
                <Outlet />
              </main>
            </div>
          ) : (
            <main className="flex-1 w-full">
              <Outlet />
            </main>
          )}

          {/* Footer */}
          <footer className="border-t border-[#E0D8CE] bg-[#FAF7F2] mt-auto">
            {/* Top section */}
            <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pt-20 pb-16">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-14">
                {/* Brand */}
                <div className="lg:col-span-2">
                  <span className="font-display text-[26px] font-light tracking-[0.25em] uppercase text-[#2A1F14]">
                    Vyberia
                  </span>
                  <div className="w-8 h-px bg-[#B8956A] mt-5 mb-5" />
                  <p className="text-[13px] text-[#9A9088] leading-relaxed max-w-[280px] font-light">
                    Curated pieces for modern living. Quality craftsmanship, delivered to your door.
                  </p>
                  <div className="flex items-center gap-4 mt-8">
                    {/* Social placeholders */}
                    {['IG', 'FB', 'TW'].map(s => (
                      <div key={s} className="w-8 h-8 border border-[#D8CEC4] flex items-center justify-center text-[9px] tracking-[0.1em] text-[#A0907E] hover:border-[#B8956A] hover:text-[#B8956A] transition-colors cursor-pointer">
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shop */}
                <div>
                  <h3 className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#B8956A] mb-6">Shop</h3>
                  <ul className="space-y-4">
                    {[
                      { to: '/products', label: 'All Products' },
                      { to: '/products?sort_by=trending', label: 'Trending' },
                      { to: '/products?sort_by=newest', label: 'New Arrivals' },
                    ].map(item => (
                      <li key={item.label}>
                        <Link to={item.to} className="text-[12px] text-[#8A7A6E] hover:text-[#B8956A] transition-colors tracking-[0.03em]">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Account */}
                <div>
                  <h3 className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#B8956A] mb-6">Account</h3>
                  <ul className="space-y-4">
                    {[
                      { to: '/profile', label: 'Profile' },
                      { to: '/orders', label: 'My Orders' },
                      { to: '/cart', label: 'Cart' },
                    ].map(item => (
                      <li key={item.label}>
                        <Link to={item.to} className="text-[12px] text-[#8A7A6E] hover:text-[#B8956A] transition-colors tracking-[0.03em]">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#B8956A] mb-6">Contact</h3>
                  <ul className="space-y-4">
                    <li className="text-[12px] text-[#8A7A6E] tracking-[0.03em]">support@vyberia.com</li>
                    <li className="text-[12px] text-[#8A7A6E] tracking-[0.03em]">+880 1700-000000</li>
                    <li className="text-[12px] text-[#8A7A6E] tracking-[0.03em]">Dhaka, Bangladesh</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Gold divider */}
            <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
              <div className="divider-gold" />
            </div>

            {/* Bottom bar */}
            <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-7">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[11px] text-[#A0907E] tracking-[0.04em]">
                  &copy; {new Date().getFullYear()} Vyberia. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                  {['bKash', 'Nagad', 'Rocket', 'COD'].map(p => (
                    <span key={p} className="text-[10px] tracking-[0.1em] uppercase text-[#A0907E] hover:text-[#B8956A] transition-colors cursor-default">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </footer>
        </div>
      </CartProvider>
    </AuthProvider>
  )
}
