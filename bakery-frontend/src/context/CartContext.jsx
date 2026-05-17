import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cartAPI } from '../services/api';
import { useToast } from './ToastContext';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);
  const { isLoggedIn } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn()) {
      setCart([]);
      setCartTotal(0);
      setCartLoaded(true);
      return;
    }
    try {
      const res = await cartAPI.getCart();
      setCart(res.data.data.items);
      setCartTotal(res.data.data.total);
    } catch (err) {
      console.error('Lỗi lấy giỏ hàng:', err);
    } finally {
      setCartLoaded(true);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const goLoginForCart = useCallback(() => {
    const next = `${location.pathname}${location.search || ''}`;
    navigate(`/login?next=${encodeURIComponent(next)}`);
  }, [navigate, location.pathname, location.search]);

  const addToCart = async (productId, variantId, quantity = 1) => {
    if (!isLoggedIn()) {
      goLoginForCart();
      return false;
    }
    try {
      await cartAPI.add({ product_id: productId, variant_id: variantId, quantity });
      showSuccess('Đã thêm vào giỏ hàng');
      await fetchCart();
      setIsCartOpen(true);
      return true;
    } catch (err) {
      showError(err.response?.data?.message || 'Không thể thêm vào giỏ hàng');
      return false;
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      await cartAPI.updateQuantity(cartItemId, quantity);
      await fetchCart();
    } catch (err) {
      showError(err.response?.data?.message || 'Lỗi cập nhật số lượng');
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await cartAPI.remove(cartItemId);
      showSuccess('Đã bỏ sản phẩm khỏi giỏ');
      await fetchCart();
    } catch (err) {
      showError('Lỗi xóa sản phẩm');
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      setCart([]);
      setCartTotal(0);
    } catch (err) {
      console.error(err);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartTotal,
        cartCount,
        cartLoaded,
        isCartOpen,
        setIsCartOpen,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        goLoginForCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
