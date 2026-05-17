import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { Spinner } from '../components/LoadingSpinner';
import CartItem from '../components/cart/CartItem';
import FreeShippingBar from '../components/cart/FreeShippingBar';

const FREE_SHIPPING_THRESHOLD = 500000;
const SHIPPING_FEE = 30000;

export default function CartPage() {
  const { cart, cartTotal, cartLoaded, updateQuantity, removeFromCart } = useContext(CartContext);
  const shippingFee = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const finalAmount = cartTotal + shippingFee;
  const remainingForFreeShip = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);

  const handleUpdate = (id, newQty, stock) => {
    if (newQty < 1) return;
    if (Number.isFinite(Number(stock)) && newQty > Number(stock)) return;
    updateQuantity(id, newQty);
  };

  const handleRemove = (cartItemId) => {
    if (window.confirm('Xóa sản phẩm này khỏi giỏ hàng?')) {
      removeFromCart(cartItemId);
    }
  };

  if (!cartLoaded) {
    return (
      <div className="cart-page cart-page--loading">
        <Spinner size={40} color="var(--primary)" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="page-container">
        <section className="container cart-page cart-page--empty">
          <div className="cart-empty__icon">
            <ShoppingBag size={52} strokeWidth={1.5} />
          </div>
          <h1>Giỏ hàng đang trống</h1>
          <p>Chọn thêm những chiếc bánh bạn thích trước khi thanh toán.</p>
          <Link to="/products" className="btn btn--primary">
            Xem menu bánh
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-container">
      <section className="container cart-page">
        <div className="checkout-steps">
          <span className="checkout-steps__item checkout-steps__item--active">1. Giỏ hàng</span>
          <ArrowRight size={16} />
          <span className="checkout-steps__item">2. Thanh toán</span>
          <ArrowRight size={16} />
          <span className="checkout-steps__item">3. Đơn hàng</span>
        </div>

        <div className="cart-page__header">
          <div>
            <h1 className="section-title-new">Giỏ hàng của bạn</h1>
            <p>{cart.length} sản phẩm. Miễn phí vận chuyển cho đơn từ 500.000đ.</p>
          </div>
          <Link to="/products" className="btn btn--outline">
            Chọn thêm bánh
          </Link>
        </div>

        <FreeShippingBar cartTotal={cartTotal} />

        <div className="cart-page__layout">
          <div className="cart-page__items">
            {cart.map((item) => (
              <CartItem
                key={item.cart_item_id}
                item={item}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
              />
            ))}
          </div>

          <aside className="cart-page__summary">
            <h2>Tạm tính đơn hàng</h2>
            <div className="summary-row">
              <span>Tạm tính</span>
              <strong>{cartTotal.toLocaleString()}đ</strong>
            </div>
            <div className="summary-row">
              <span><Truck size={16} /> Phí vận chuyển</span>
              <strong className={shippingFee === 0 ? 'summary-row__success' : ''}>
                {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString()}đ`}
              </strong>
            </div>
            {remainingForFreeShip > 0 && (
              <p className="cart-page__hint">
                Mua thêm {remainingForFreeShip.toLocaleString()}đ để được miễn phí vận chuyển.
              </p>
            )}
            <div className="summary-row summary-row--total">
              <span>Tổng tạm tính</span>
              <strong>{finalAmount.toLocaleString()}đ</strong>
            </div>
            <Link to="/checkout" className="btn btn--primary btn--block btn--lg">
              Tiến hành thanh toán
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
