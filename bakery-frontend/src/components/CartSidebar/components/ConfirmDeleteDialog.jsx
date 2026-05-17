import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

function ConfirmDeleteDialog({ isOpen, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="cart-confirm-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="cart-confirm-dialog"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <AlertCircle size={40} style={{ color: 'var(--primary)', marginBottom: 12 }} />
            <h4 style={{ fontSize: 16, marginBottom: 8, color: 'var(--text-main)' }}>Xóa sản phẩm?</h4>
            <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 20, lineHeight: 1.5 }}>
              Bạn có chắc muốn bỏ sản phẩm này khỏi giỏ hàng?
            </p>
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button className="btn btn--ghost" style={{ flex: 1 }} onClick={onCancel}>
                Hủy
              </button>
              <button className="btn btn--primary" style={{ flex: 1 }} onClick={onConfirm}>
                Xóa
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDeleteDialog;
