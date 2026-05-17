import { Link } from 'react-router-dom';
import { X, Phone } from 'lucide-react';
import BrandLogo from '../BrandLogo';

export default function MobileDrawer({ isOpen, setIsOpen, user, navigate }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-menu-overlay" onClick={() => setIsOpen(false)} />
      <div className="mobile-menu-drawer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <BrandLogo onClick={() => { setIsOpen(false); navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          <button 
            onClick={() => setIsOpen(false)} 
            style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}
            aria-label="Đóng menu"
          >
            <X size={28} />
          </button>
        </div>

        <ul className="mobile-menu-links">
          <li><Link to="/" onClick={() => setIsOpen(false)}>Trang chủ</Link></li>
          <li><Link to="/products" onClick={() => setIsOpen(false)}>Menu bánh</Link></li>
          <li><Link to="/promotions" onClick={() => setIsOpen(false)}>Khuyến mãi</Link></li>
          <li><Link to="/stores" onClick={() => setIsOpen(false)}>Cửa hàng</Link></li>
          {user && user.role === 'admin' ? (
            <li><Link to="/admin" onClick={() => setIsOpen(false)}>Bảng điều khiển</Link></li>
          ) : (
            <li><Link to="/membership" onClick={() => setIsOpen(false)}>Thành viên</Link></li>
          )}
          <li><Link to="/contact" onClick={() => setIsOpen(false)}>Liên hệ</Link></li>
          {user && user.role !== 'admin' && (
            <li><Link to="/my-orders" onClick={() => setIsOpen(false)}>Đơn hàng của tôi</Link></li>
          )}
        </ul>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--primary)', fontWeight: 600 }}>
            <Phone size={20} />
            <span>090 123 4567</span>
          </div>
          {!user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/login" onClick={() => setIsOpen(false)} className="btn btn--outline" style={{ textAlign: 'center', textDecoration: 'none' }}>Đăng nhập</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="btn btn--primary" style={{ textAlign: 'center', textDecoration: 'none' }}>Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
