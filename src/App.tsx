import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PortalLayout from './layouts/PortalLayout'
import CMSLayout from './layouts/CMSLayout'
import HomePage from './pages/portal/HomePage'
import ProductsPage from './pages/portal/ProductsPage'
import ProductDetailPage from './pages/portal/ProductDetailPage'
import LoginPage from './pages/portal/LoginPage'
import RegisterPage from './pages/portal/RegisterPage'
import CartPage from './pages/portal/CartPage'
import CheckoutPage from './pages/portal/CheckoutPage'
import OrdersPage from './pages/portal/OrdersPage'
import OrderDetailPage from './pages/portal/OrderDetailPage'
import ProfilePage from './pages/portal/ProfilePage'
import CMSLoginPage from './pages/cms/CMSLoginPage'
import CMSDashboardPage from './pages/cms/CMSDashboardPage'
import CMSProductsPage from './pages/cms/CMSProductsPage'
import CMSCategoriesPage from './pages/cms/CMSCategoriesPage'
import CMSOrdersPage from './pages/cms/CMSOrdersPage'
import CMSUsersPage from './pages/cms/CMSUsersPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PortalLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:identifier" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="/cms" element={<CMSLayout />}>
          <Route index element={<Navigate to="/cms/dashboard" replace />} />
          <Route path="login" element={<CMSLoginPage />} />
          <Route path="dashboard" element={<CMSDashboardPage />} />
          <Route path="products" element={<CMSProductsPage />} />
          <Route path="categories" element={<CMSCategoriesPage />} />
          <Route path="orders" element={<CMSOrdersPage />} />
          <Route path="users" element={<CMSUsersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
