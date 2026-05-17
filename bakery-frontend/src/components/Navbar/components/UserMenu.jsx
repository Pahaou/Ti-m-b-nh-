import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, ShoppingCart, Heart, LogOut } from 'lucide-react';

function UserMenu({ user, isAdmin, logout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 300);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="user-menu" style={{ position: 'relative', paddingBottom: '10px', top: '5px' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', paddingBottom: '5px' }}>
        <img 
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname)}&background=c45c6a&color=fff`} 
          alt="user" 
          style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--primary-soft)' }} 
        />
      </div>
      
      {dropdownOpen && (
        <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: '15px', zIndex: 1040 }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <div className="dropdown-menu" style={{ background: 'var(--bg-light)', boxShadow: 'var(--shadow-lg)', borderRadius: '12px', overflow: 'hidden', minWidth: '200px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)' }}>
            {isAdmin() && (
              <button onClick={(e) => { e.preventDefault(); navigate('/admin'); setDropdownOpen(false); }} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                <LayoutDashboard size={16} /> Quản trị Admin
              </button>
            )}
            <button onClick={(e) => { e.preventDefault(); navigate('/profile'); setDropdownOpen(false); }} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
              <Settings size={16} /> Tài khoản của tôi
            </button>
            {!isAdmin() && (
              <>
                <button onClick={(e) => { e.preventDefault(); navigate('/my-orders'); setDropdownOpen(false); }} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                  <ShoppingCart size={16} /> Đơn hàng đã mua
                </button>
                <button onClick={(e) => { e.preventDefault(); navigate('/wishlist'); setDropdownOpen(false); }} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', color: '#ff5252', borderBottom: '1px solid var(--border-color)', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                  <Heart size={16} /> Bánh yêu thích
                </button>
              </>
            )}
            <button onClick={(e) => { e.preventDefault(); handleLogout(); }} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', color: '#ff5252', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
