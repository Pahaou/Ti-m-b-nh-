import { motion } from 'framer-motion';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CartItem({ item, onUpdate, onRemove }) {
  return (
    <motion.div
      className="cart-item"
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0, padding: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <img
        src={item.thumbnail || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80'}
        alt={item.name}
        className="cart-item__img"
      />
      <div className="cart-item-info">
        <h4>{item.name}</h4>
        <p style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>Size: {item.size_name}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 }}>
          <span className="cart-item__price">
            {(Number(item.base_price) + Number(item.price_adjustment)).toLocaleString()}đ
          </span>
          <div className="qty-control">
            <button 
              type="button" 
              className="qty-btn" 
              onClick={() => onUpdate(item.cart_item_id, item.quantity - 1, item.stock_quantity)}
            >
              <Minus size={14} />
            </button>
            <span style={{ fontSize: 14, width: 24, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
            <button 
              type="button" 
              className="qty-btn" 
              onClick={() => onUpdate(item.cart_item_id, item.quantity + 1, item.stock_quantity)}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.cart_item_id)}
        className="cart-item__remove"
        aria-label={`Xóa ${item.name}`}
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  );
}
