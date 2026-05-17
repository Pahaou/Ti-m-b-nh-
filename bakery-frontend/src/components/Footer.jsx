import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Footer() {
  const navigate = useNavigate();

  const goHomeSection = useCallback(
    (sectionId) => {
      if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 280);
      } else {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [navigate],
  );

  return (
    <footer className="footer-light-container" id="bottom">
      <div className="container">
        <div className="footer-light-grid">

          {/* Cột 1: Logo + slogan + mạng xã hội */}
          <div className="footer-light-col">
            {/* Logo inline nhỏ gọn giống mẫu */}
            <div style={{ marginBottom: '15px' }}>
              <BrandLogo size="sm" />
            </div>

            <p className="footer-light-slogan">Bánh ngon tiệc vui</p>

            <div className="footer-light-socials">
              <a href="#" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="#" target="_blank" rel="noopener noreferrer">TikTok</a>
              <a href="#" target="_blank" rel="noopener noreferrer">Zalo</a>
            </div>
          </div>

          {/* Cột 2: Liên kết */}
          <div className="footer-light-col">
            <h4 className="footer-light-heading">Liên kết</h4>
            <ul className="footer-light-links">
              <li>
                <button onClick={() => { navigate('/'); window.scrollTo(0, 0); }}>Trang chủ</button>
              </li>
              <li>
                <button onClick={() => goHomeSection('featured')}>Sản phẩm</button>
              </li>
              <li>
                <button onClick={() => goHomeSection('membership')}>Chương trình thành viên</button>
              </li>
              <li>
                <button onClick={() => goHomeSection('all-products')}>Cửa hàng</button>
              </li>
              <li>
                <button onClick={() => goHomeSection('bottom')}>FAQ</button>
              </li>
            </ul>
          </div>

          {/* Cột 3: Tài khoản */}
          <div className="footer-light-col">
            <h4 className="footer-light-heading">Tài khoản</h4>
            <ul className="footer-light-links">
              <li>
                <Link to="/login">Đăng nhập</Link>
              </li>
              <li>
                <Link to="/profile">Hạng thành viên</Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div className="footer-light-col footer-contact-col">
            <h4 className="footer-light-heading">Liên hệ</h4>
            <p>58 Đường Số 8, Phường Linh Trung, TP. Thủ Đức</p>
            <p>Hotline: <span className="hotline-text">090.123.4567</span></p>
            <p>Email: hi@hxhbakery.com</p>
            <p>Giờ mở cửa: 8:00 - 22:00</p>
          </div>

        </div>
      </div>

      {/* Bottom bar copyright */}
      <div className="footer-light-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} HXH Bakery. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>

      {/* Floating Chat Widgets */}
      <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 15 }}>
        <a
          href="https://m.me/"
          target="_blank"
          rel="noopener noreferrer"
          title="Messenger"
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: '#0084FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageCircle size={24} />
        </a>
        <a
          href="https://zalo.me/0901234567"
          target="_blank"
          rel="noopener noreferrer"
          title="Zalo"
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: '#0068FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            fontSize: 14,
            fontWeight: 800,
            textDecoration: 'none',
            transition: 'transform 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Zalo
        </a>
      </div>
    </footer>
  );
}
