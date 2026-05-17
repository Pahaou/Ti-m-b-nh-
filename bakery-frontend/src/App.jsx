// v1.1.1 - Forced sync and Admin UI cleanup
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppProvider from './context/AppProvider';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import ScrollToTop from './components/ScrollToTop';

import './App.css';

/* ── Lazy-loaded pages ── */
import HomePage from './pages/HomePage';
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const MembershipPage = lazy(() => import('./pages/MembershipPage'));
const PromotionsPage = lazy(() => import('./pages/PromotionsPage'));
const StoresPage = lazy(() => import('./pages/StoresPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
import AdminDashboard from './pages/AdminDashboard';

/* ── Page loading fallback ── */
function PageFallback() {
  return (
    <div className="page-loading">
      <div className="page-loading__spinner" />
      <p className="page-loading__text">Đang tải...</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppProvider>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* All customer pages share MainLayout (Navbar + Footer + BottomNav + CartSidebar) */}
            <Route element={<MainLayout />}>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/promotions" element={<PromotionsPage />} />
              <Route path="/stores" element={<StoresPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />

              {/* Protected Routes (Must login) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/my-orders" element={<MyOrdersPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/membership" element={<MembershipPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>
            </Route>

            {/* Admin Routes — standalone layout, no cart/bottom nav */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </Suspense>
      </AppProvider>
    </Router>
  );
}

export default App;
