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
        <div className="min-h-screen flex flex-col">
          <Header />
          {showSidebar ? (
            <div className="flex-1 flex w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-8 gap-10">
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
          <footer className="border-t border-[#eee] mt-auto">
            <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-16">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                <div>
                  <span className="text-[18px] font-semibold tracking-[-0.04em]">VYBERIA</span>
                  <p className="text-[13px] text-muted leading-relaxed mt-4 max-w-[260px]">
                    Curated products for modern living. Quality craftsmanship, delivered to your door.
                  </p>
                </div>
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#999] mb-5">Shop</h3>
                  <ul className="space-y-3">
                    <li><Link to="/products" className="text-[13px] text-[#555] hover:text-dark transition-colors">All Products</Link></li>
                    <li><Link to="/products?sort_by=trending" className="text-[13px] text-[#555] hover:text-dark transition-colors">Trending</Link></li>
                    <li><Link to="/products?sort_by=newest" className="text-[13px] text-[#555] hover:text-dark transition-colors">New Arrivals</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#999] mb-5">Account</h3>
                  <ul className="space-y-3">
                    <li><Link to="/profile" className="text-[13px] text-[#555] hover:text-dark transition-colors">Profile</Link></li>
                    <li><Link to="/orders" className="text-[13px] text-[#555] hover:text-dark transition-colors">Orders</Link></li>
                    <li><Link to="/cart" className="text-[13px] text-[#555] hover:text-dark transition-colors">Cart</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#999] mb-5">Info</h3>
                  <ul className="space-y-3">
                    <li className="text-[13px] text-[#555]">support@vyberia.com</li>
                    <li className="text-[13px] text-[#555]">+880 1700-000000</li>
                    <li className="text-[13px] text-[#555]">Dhaka, Bangladesh</li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between mt-14 pt-8 border-t border-[#eee] gap-4">
                <p className="text-[12px] text-[#aaa]">&copy; {new Date().getFullYear()} Vyberia. All rights reserved.</p>
                <div className="flex items-center gap-5 text-[12px] text-[#aaa]">
                  <span>bKash</span>
                  <span>Nagad</span>
                  <span>Rocket</span>
                  <span>COD</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </CartProvider>
    </AuthProvider>
  )
}
