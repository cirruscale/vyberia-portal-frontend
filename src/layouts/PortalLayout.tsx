import { Outlet, useLocation } from 'react-router-dom'
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
        <div className="min-h-screen flex flex-col bg-warm">
          <Header />
          {showSidebar ? (
            <div className="flex-1 flex w-full px-4 sm:px-8 lg:px-12 py-6 gap-8">
              <CategorySidebar />
              <main className="flex-1 min-w-0">
                <Outlet />
              </main>
            </div>
          ) : (
            <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6">
              <Outlet />
            </main>
          )}
          <footer className="border-t border-stone-200 mt-auto bg-warm">
            <div className="px-4 sm:px-8 lg:px-12 py-5 text-center">
              <p className="text-xs text-muted">&copy; {new Date().getFullYear()} Vyberia. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </CartProvider>
    </AuthProvider>
  )
}
