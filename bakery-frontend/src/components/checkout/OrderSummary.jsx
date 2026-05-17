import { Truck } from 'lucide-react';
import { ButtonLoading } from '../LoadingSpinner';

export default function OrderSummary({ 
  cart, 
  cartTotal, 
  couponCode, 
  setCouponCode, 
  handleApplyCoupon, 
  verifyingCoupon, 
  shippingFee, 
  discountInfo, 
  discountAmount, 
  finalAmount, 
  submitting 
}) {
  return (
    <div style={{position: 'sticky', top: '100px'}}>
      <div style={{
        background: 'var(--bg-light)', borderRadius: '25px', boxShadow: 'var(--shadow-md)',
        padding: '35px', overflow: 'hidden', position: 'relative', border: '1px solid var(--border-color)'
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          backgroundImage: 'radial-gradient(circle, var(--bg-muted) 2px, transparent 2px)',
          backgroundSize: '12px 12px', backgroundPosition: 'center'
        }}></div>

        <h3 style={{fontSize: '22px', textAlign: 'center', marginBottom: '30px', fontWeight: 800, color: 'var(--text-main)'}}>Chi Tiết Đơn Hàng</h3>

        <div style={{marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px dashed var(--border-color)', maxHeight: '300px', overflowY: 'auto'}}>
          {cart.map(item => (
            <div key={item.cart_item_id} style={{display: 'flex', gap: '15px', marginBottom: '20px'}}>
              <div style={{position: 'relative'}}>
                <img src={item.thumbnail} alt={item.name} style={{width: 65, height: 65, objectFit: 'cover', borderRadius: '12px'}} />
                <span style={{
                  position: 'absolute', top: -8, right: -8, background: 'var(--secondary)', color: 'white',
                  width: 22, height: 22, borderRadius: '50%', fontSize: 11, fontWeight: 'bold',
                  display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>{item.quantity}</span>
              </div>
              <div style={{flex: 1}}>
                <h4 style={{fontSize: '14px', margin: 0, color: 'var(--text-main)', fontWeight: 700}}>{item.name}</h4>
                <p style={{fontSize: '12px', color: 'var(--text-light)', margin: '4px 0'}}>Size: {item.size_name}</p>
                <div style={{fontWeight: 800, color: 'var(--primary)', fontSize: '15px'}}>
                  {((Number(item.base_price) + Number(item.price_adjustment)) * item.quantity).toLocaleString()}đ
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{marginBottom: '30px'}}>
          <label style={{fontSize: '14px', color: 'var(--text-main)', marginBottom: '10px', display: 'block', fontWeight: 700}}>Mã giảm giá</label>
          <div style={{display: 'flex', gap: '10px'}}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Nhập mã tại đây..."
              value={couponCode}
              onChange={e => setCouponCode(e.target.value.toUpperCase())}
              style={{padding: '12px 15px', borderRadius: '12px', flex: 1, border: '1px solid var(--border-color)', background: 'var(--bg-muted)', color: 'var(--text-main)'}}
            />
            <ButtonLoading 
              type="button"
              isLoading={verifyingCoupon}
              onClick={handleApplyCoupon}
              className="btn-outline"
              style={{padding: '0 25px', borderRadius: '12px', fontSize: '14px', fontWeight: 700}}
            >
              Áp dụng
            </ButtonLoading>
          </div>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', color: 'var(--text-light)'}}>
            <span style={{fontWeight: 500}}>Tạm tính</span>
            <span style={{fontWeight: 700, color: 'var(--text-main)'}}>{cartTotal.toLocaleString()}đ</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', color: 'var(--text-light)'}}>
            <span style={{display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500}}><Truck size={16}/> Phí vận chuyển</span>
            <span style={{fontWeight: 700, color: shippingFee === 0 ? 'var(--success)' : 'var(--text-main)'}}>
              {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString()}đ`}
            </span>
          </div>
          <p style={{margin: '-6px 0 0', fontSize: '12px', color: 'var(--text-muted)'}}>
            Miễn phí vận chuyển cho đơn từ 500.000đ.
          </p>
          {discountInfo && (
            <div style={{display: 'flex', justifyContent: 'space-between', color: 'var(--success)', background: 'var(--success-soft)', padding: '10px', borderRadius: '10px'}}>
              <span style={{fontWeight: 700}}>Giảm giá ({discountInfo.code})</span>
              <span style={{fontWeight: 800}}>-{discountAmount.toLocaleString()}đ</span>
            </div>
          )}
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '25px 0', borderTop: '2px dashed var(--border-color)', marginBottom: '30px'
        }}>
          <span style={{fontSize: '18px', fontWeight: 700, color: 'var(--text-main)'}}>Tổng thanh toán</span>
          <span style={{fontSize: '28px', fontWeight: 900, color: 'var(--primary)'}}>
            {finalAmount.toLocaleString()}đ
          </span>
        </div>

        <ButtonLoading 
          isLoading={submitting} 
          type="submit" 
          className="btn-primary" 
          style={{width: '100%', padding: '18px', fontSize: '18px', borderRadius: '15px', boxShadow: 'var(--shadow-md)'}}
        >
          Xác Nhận Đặt Hàng
        </ButtonLoading>

        <p style={{textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)'}}>
          Bằng cách đặt hàng, bạn đồng ý với các Điều khoản & Chính sách của HXH Bakery.
        </p>
      </div>
    </div>
  );
}
