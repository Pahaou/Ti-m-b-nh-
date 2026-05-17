import { Link, useNavigate } from 'react-router-dom';
import { X, Phone } from 'lucide-react';
import BrandLogo from '../../BrandLogo';

function MobileDrawer({ isOpen, setIsOpen, scrollToSection, user }) {
  const navigate = useNavigate();

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
          <li><button onClick={() => { setIsOpen(false); scrollToSection('top'); }}>Trang chủ</button></li>
          <li><button onClick={() => { setIsOpen(false); scrollToSection('featured'); }}>Sản phẩm</button></li>
          <li><button onClick={() => { setIsOpen(false); scrollToSection('all-products'); }}>Cửa hàng</button></li>
          <li><button onClick={() => { setIsOpen(false); scrollToSection('bottom'); }}>Liên hệ</button></li>
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

export default MobileDrawer;
