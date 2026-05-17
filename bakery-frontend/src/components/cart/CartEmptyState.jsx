import { ShoppingCart, ShoppingBag } from 'lucide-react';

export default function CartEmptyState({ user, onAction, onClose }) {
  if (!user) {
    return (
      <div className="cart-empty">
        <div className="cart-empty__icon">
          <ShoppingCart size={48} strokeWidth={1.5} />
        </div>
        <h4 className="cart-empty__title">Đăng nhập để dùng giỏ hàng</h4>
        <p className="cart-empty__desc">Lưu món và thanh toán nhanh hơn sau khi đăng nhập.</p>
        <button type="button" className="btn btn--primary btn--block" style={{ maxWidth: 260 }} onClick={() => { onClose(); onAction(); }}>
          Đăng nhập
        </button>
        <button type="button" className="btn btn--ghost" style={{ marginTop: 8 }} onClick={onClose}>
          Tiếp tục xem bánh
        </button>
      </div>
    );
  }

  return (
    <div className="cart-empty">
      <div className="cart-empty__icon">
        <ShoppingBag size={48} strokeWidth={1.5} />
      </div>
      <h4 className="cart-empty__title">Giỏ hàng đang trống</h4>
      <p className="cart-empty__desc">Hãy thêm những chiếc bánh yêu thích vào giỏ nhé!</p>
      <button type="button" className="btn btn--outline" onClick={onClose}>
        Khám phá bánh ngay
      </button>
    </div>
  );
}
