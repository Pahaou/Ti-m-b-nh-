import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { wishlistAPI } from '../services/api';
import { useToast } from './ToastContext';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      const res = await wishlistAPI.getWishlist();
      if (res.data.success) {
        setWishlist(res.data.data.map((item) => item.product_id));
      }
    } catch (error) {
      console.error('Lỗi tải wishlist:', error);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const goLogin = () => {
    const next = `${location.pathname}${location.search || ''}`;
    navigate(`/login?next=${encodeURIComponent(next)}`);
  };

  const toggleWishlist = async (productId) => {
    if (!user) {
      goLogin();
      return false;
    }

    const isLoved = wishlist.includes(productId);
    try {
      if (isLoved) {
        setWishlist((prev) => prev.filter((id) => id !== productId));
        await wishlistAPI.remove(productId);
      } else {
        setWishlist((prev) => [...prev, productId]);
        await wishlistAPI.add({ product_id: productId });
        showSuccess('Đã thêm vào yêu thích');
      }
      return true;
    } catch (err) {
      await fetchWishlist();
      showError(err.response?.data?.message || 'Không thể cập nhật yêu thích');
      return false;
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
