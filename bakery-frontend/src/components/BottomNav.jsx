import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, Heart, User, LayoutDashboard } from 'lucide-react';
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

export default function BottomNav() {
  const location = useLocation();
  const { cartCount } = useContext(CartContext);
  const { user, isAdmin } = useContext(AuthContext);
  const admin = isAdmin();

  const customerItems = [
    { path: '/', label: 'Trang chủ', icon: Home },
    { path: '/products', label: 'Menu', icon: ShoppingBag },
    { path: user ? '/cart' : '/login?next=%2Fcart', matchPath: '/cart', label: 'Giỏ hàng', icon: ShoppingCart, badge: cartCount },
    { path: user ? '/wishlist' : '/login?next=%2Fwishlist', matchPath: '/wishlist', label: 'Yêu thích', icon: Heart },
    { path: user ? '/profile' : '/login', matchPath: user ? '/profile' : '/login', label: 'Tôi', icon: User },
  ];

  const adminItems = [
    { path: '/', label: 'Trang chủ', icon: Home },
    { path: '/products', label: 'Menu', icon: ShoppingBag },
    { path: '/admin', label: 'Quản trị', icon: LayoutDashboard },
    { path: '/profile', label: 'Tôi', icon: User },
  ];

  const navItems = admin ? adminItems : customerItems;

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        {navItems.map((item) => {
          const Icon = item.icon;
          const matchPath = item.matchPath || item.path;
          const isActive = location.pathname === matchPath;
          
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="icon-wrapper">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge > 0 && <span className="bottom-nav-badge">{item.badge}</span>}
              </div>
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
