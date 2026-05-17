import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { X, ShoppingBag, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useIsMobile from '../hooks/useIsMobile';

/* ─── Modular Components ─── */
import CartItem from './cart/CartItem';
import FreeShippingBar from './cart/FreeShippingBar';
import CartEmptyState from './cart/CartEmptyState';

export default function CartSidebar() {
  const { isCartOpen, setIsCartOpen, cart, cartTotal, updateQuantity, removeFromCart, goLoginForCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const isMobile = useIsMobile();

  const handleUpdate = (id, newQty, stock) => {
    if (newQty < 1 || newQty > stock) return;
    updateQuantity(id, newQty);
  };

  const confirmRemove = () => {
    if (confirmDeleteId) {
      removeFromCart(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            className="cart-overlay open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsCartOpen(false)}
          />
        )}
      </AnimatePresence>

      <div
        className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}
        style={{ width: isMobile ? '100vw' : '420px', maxWidth: isMobile ? '100vw' : '100%' }}
      >
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={20} style={{ color: 'var(--primary)' }} />
            <h3>Giỏ hàng của bạn</h3>
          </div>
          <button type="button" className="close-cart" onClick={() => setIsCartOpen(false)} aria-label="Đóng giỏ hàng">
            <X size={20} />
          </button>
        </div>

        {user && cart.length > 0 && <FreeShippingBar cartTotal={cartTotal} />}

        <div className="cart-body">
          {(!user || cart.length === 0) ? (
            <CartEmptyState 
              user={user} 
              onAction={goLoginForCart} 
              onClose={() => setIsCartOpen(false)} 
            />
          ) : (
            <AnimatePresence>
              {cart.map((item) => (
                <CartItem 
                  key={item.cart_item_id} 
                  item={item} 
                  onUpdate={handleUpdate} 
                  onRemove={setConfirmDeleteId} 
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {user && cart.length > 0 && (
          <div className="cart-footer">
            <div className="total-row">
              <span>Tổng cộng:</span>
              <span className="total-row__amount">{cartTotal.toLocaleString()}đ</span>
            </div>
            <Link
              to="/checkout"
              className="btn btn--primary btn--block btn--lg"
              onClick={() => setIsCartOpen(false)}
            >
              Thanh toán ngay
            </Link>
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div className="cart-confirm-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="cart-confirm-dialog" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}>
              <AlertCircle size={40} style={{ color: 'var(--primary)', marginBottom: 12 }} />
              <h4 style={{ fontSize: 16, marginBottom: 8 }}>Xóa sản phẩm?</h4>
              <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 20 }}>
                Bạn có chắc muốn bỏ sản phẩm này khỏi giỏ hàng?
              </p>
              <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                <button className="btn btn--ghost" style={{ flex: 1 }} onClick={() => setConfirmDeleteId(null)}>Hủy</button>
                <button className="btn btn--primary" style={{ flex: 1 }} onClick={confirmRemove}>Xóa</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
