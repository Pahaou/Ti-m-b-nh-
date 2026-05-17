import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';
import CartSidebar from './CartSidebar';

/**
 * MainLayout — layout wrapper chung cho tất cả pages.
 * Đảm bảo Navbar + Footer + BottomNav + CartSidebar
 * luôn consistent, không cần import riêng trong mỗi page.
 */
export default function MainLayout() {
  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>
      <div className="page-backdrop" />
      <Navbar />
      <CartSidebar />

      <main style={{ paddingTop: '70px' }}>
        <Outlet />
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
