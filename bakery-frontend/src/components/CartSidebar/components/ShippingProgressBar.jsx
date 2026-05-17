import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';

const FREE_SHIPPING_THRESHOLD = 500000;

function ShippingProgressBar({ cartTotal, user, hasItems }) {
  if (!user || !hasItems) return null;

  const shippingProgress = Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remaining = FREE_SHIPPING_THRESHOLD - cartTotal;

  return (
    <div className="cart-shipping-bar">
      {remaining > 0 ? (
        <p className="cart-shipping-bar__text">
          <Truck size={16} />
          Mua thêm <strong>{remaining.toLocaleString()}đ</strong> để được <strong>miễn phí giao hàng</strong>
        </p>
      ) : (
        <p className="cart-shipping-bar__text cart-shipping-bar__text--done">
          <Truck size={16} />
          Bạn được <strong>miễn phí giao hàng!</strong>
        </p>
      )}
      <div className="cart-shipping-bar__track">
        <motion.div
          className="cart-shipping-bar__fill"
          initial={{ width: 0 }}
          animate={{ width: `${shippingProgress}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export default ShippingProgressBar;
