import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { notificationAPI } from '../services/api';
import { ShoppingCart, User, LogOut, Bell, Moon, Sun, Menu, LayoutDashboard, Gift, Package, Search, Heart } from 'lucide-react';
import BrandLogo from './BrandLogo';
import useIsMobile from '../hooks/useIsMobile';

/* ─── Modular Components ─── */
import NotificationDropdown from './Navbar/NotificationDropdown';
import MobileDrawer from './Navbar/MobileDrawer';

export default function Navbar() {
  const showDrawerToggle = useIsMobile(1025);
  const { user, logout, isAdmin } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const { theme, toggleTheme } = useTheme();
  const admin = isAdmin();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const dropdownTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.data);
    } catch (err) { console.error('Notif error', err); }
  };

  useEffect(() => {
    if (user) {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 120000);
        return () => clearInterval(interval);
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
        await notificationAPI.markRead(id);
        fetchNotifications();
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="navbar" style={{
      background: theme === 'dark' ? 'rgba(26, 25, 24, 0.98)' : 'rgba(255, 255, 255, 0.98)',
      boxShadow: theme === 'dark' ? '0 4px 20px rgba(0,0,0,0.4)' : '0 2px 15px rgba(0,0,0,0.05)',
      padding: '12px 0',
      position: 'fixed',
      left: 0,
      width: '100%',
      top: 0,
      zIndex: 1000,
      borderBottom: '1px solid var(--border-color)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      <div className="container navbar-center-layout">
        
        <div className="navbar-logo-left" style={{ marginRight: '60px' }}>
          <BrandLogo size="sm" onDark={theme === 'dark'} />
        </div>

        <ul className="nav-links--center">
          <li><Link className="navbar-btn-luxury" to="/">Trang<br/>chủ</Link></li>
          <li><Link className="navbar-btn-luxury" to="/products">Menu<br/>bánh</Link></li>
          <li><Link className="navbar-btn-luxury" to="/promotions">Khuyến<br/>mãi</Link></li>
          <li><Link className="navbar-btn-luxury" to="/stores">Cửa<br/>hàng</Link></li>
          {admin ? (
            <li><Link className="navbar-btn-luxury" to="/admin">Quản<br/>trị</Link></li>
          ) : (
            <li><Link className="navbar-btn-luxury" to="/membership">Thành<br/>viên</Link></li>
          )}
          <li><Link className="navbar-btn-luxury" to="/contact">Liên<br/>hệ</Link></li>
        </ul>

        <div className="navbar-actions">
          <button type="button" onClick={toggleTheme} className="navbar-icon-btn">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {!admin && (
            <>
              <Link to="/products" className="navbar-icon-btn" aria-label="Tìm kiếm bánh">
                <Search size={19} />
              </Link>
              <Link to={user ? '/wishlist' : '/login?next=%2Fwishlist'} className="navbar-icon-btn" aria-label="Sản phẩm yêu thích">
                <Heart size={19} />
              </Link>
              <Link to={user ? '/cart' : '/login?next=%2Fcart'} className="navbar-icon-btn" style={{ position: 'relative' }} aria-label="Giỏ hàng">
                <ShoppingCart size={20} />
                <span className="navbar-cart-badge" style={{ opacity: user ? 1 : 0.35 }}>
                  {user ? cartCount : 0}
                </span>
              </Link>
            </>
          )}

          {user && (
            <div style={{ position: 'relative' }}>
              <button type="button" className="navbar-icon-btn" onClick={() => setNotifOpen(!notifOpen)} style={{ position: 'relative' }}>
                <Bell size={20} />
                {notifications.some((n) => !n.is_read) && <span className="navbar-notif-dot" />}
              </button>
              <NotificationDropdown 
                isOpen={notifOpen} 
                setIsOpen={setNotifOpen} 
                notifications={notifications} 
                markAsRead={markAsRead} 
              />
            </div>
          )}

          {user ? (
            <div 
              className="user-menu" 
              style={{ position: 'relative' }} 
              onMouseEnter={() => {
                if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                setDropdownOpen(true);
              }} 
              onMouseLeave={() => {
                dropdownTimeoutRef.current = setTimeout(() => {
                  setDropdownOpen(false);
                }, 150);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setDropdownOpen(!dropdownOpen)}>
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname)}&background=c45c6a&color=fff`} 
                  alt="user" 
                  style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--primary-soft)' }} 
                />
              </div>
              {dropdownOpen && (
                <div 
                  className="dropdown-menu-premium animate-fade-in"
                  style={{ 
                    position: 'absolute', 
                    top: 'calc(100% + 15px)', 
                    right: 0, 
                    width: '240px',
                    backgroundColor: theme === 'dark' ? '#1A1918' : '#FFFFFF',
                    borderRadius: '16px',
                    boxShadow: theme === 'dark' ? '0 10px 40px rgba(0,0,0,0.8)' : '0 10px 40px rgba(0,0,0,0.15)',
                    padding: '12px',
                    zIndex: 9999,
                    opacity: 1,
                    visibility: 'visible',
                    border: '1px solid var(--border-color)',
                  }}
                  onMouseEnter={() => {
                    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                  }}
                >
                  <div style={{ padding: '15px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-main)', marginBottom: 2 }}>{user.fullname}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{admin ? 'Quản trị viên' : 'Thành viên'}</div>
                  </div>
                  
                  <div className="dropdown-links-grid">
                    {admin && (
                      <button onClick={() => navigate('/admin')} className="dropdown-item-luxury">
                        <div className="item-icon-bg"><LayoutDashboard size={16} /></div>
                        <span>Bảng điều khiển</span>
                      </button>
                    )}
                    <button onClick={() => navigate('/profile')} className="dropdown-item-luxury">
                      <div className="item-icon-bg"><User size={16} /></div>
                      <span>Tài khoản của tôi</span>
                    </button>
                    {!admin && (
                      <>
                        <button onClick={() => navigate('/membership')} className="dropdown-item-luxury">
                          <div className="item-icon-bg"><Gift size={16} /></div>
                          <span>Điểm thưởng</span>
                        </button>
                        <button onClick={() => navigate('/my-orders')} className="dropdown-item-luxury">
                          <div className="item-icon-bg"><Package size={16} /></div>
                          <span>Đơn hàng của tôi</span>
                        </button>
                      </>
                    )}
                    
                    <div style={{ margin: '8px 5px', height: 1, background: 'var(--border-color)' }} />
                    
                    <button onClick={() => logout()} className="dropdown-item-luxury logout-luxury">
                      <div className="item-icon-bg"><LogOut size={16} /></div>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn--primary btn--login-nav"><User size={16} /> Đăng nhập</Link>
          )}

          {showDrawerToggle && (
            <button className="mobile-nav-toggle" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={28} />
            </button>
          )}
        </div>
      </div>

      <MobileDrawer 
        isOpen={isMobileMenuOpen} 
        setIsOpen={setIsMobileMenuOpen} 
        user={user} 
        navigate={navigate} 
      />
    </nav>
  );
}
