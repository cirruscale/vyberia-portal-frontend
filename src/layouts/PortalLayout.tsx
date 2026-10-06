import { Outlet } from 'react-router-dom'
import { AuthProvider } from '../lib/context/AuthContext'
import { CartProvider } from '../lib/context/CartContext'
import { Header } from '../components/layout/Header'
import { CategorySidebar } from '../components/layout/CategorySidebar'

export default function PortalLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col" style={{ background: '#B8CEDC' }}>
          <Header />
          <div className="flex-1 flex pl-4">
            <CategorySidebar />
            <main className="flex-1 min-w-0 py-6 px-6">
              <Outlet />
            </main>
          </div>
          <footer className="border-t border-blue-200 py-8 mt-auto" style={{ background: 'rgba(184,206,220,0.7)' }}>
            <div className="max-w-7xl mx-auto px-4 text-center text-sm text-black font-medium">
              © {new Date().getFullYear()} Vyberia. All rights reserved.
            </div>
          </footer>
        </div>
      </CartProvider>
    </AuthProvider>
  )
}
