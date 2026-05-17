import { X, CheckCircle, Landmark, Copy, ArrowRight } from 'lucide-react';
import { SHOP_PAYMENT_CONFIG } from '../../config/payment';

export default function PaymentQRModal({ 
  showQRModal, 
  setShowQRModal, 
  createdOrder, 
  paymentMethod, 
  selectedPayerBank, 
  copyToClipboard, 
  handleFinishPayment 
}) {
  if (!showQRModal || !createdOrder) return null;

  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
        background: 'rgba(0,0,0,0.85)', zIndex: 3000, 
        display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
      }}
      onClick={() => setShowQRModal(false)}
    >
        <div className="animate-slide-up" style={{
            background: 'var(--bg-light)', width: '100%', maxWidth: '500px', 
            borderRadius: '30px', padding: '40px', textAlign: 'center',
            position: 'relative', boxShadow: 'var(--shadow-lg)'
        }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowQRModal(false)}
              style={{ 
                position: 'absolute', top: 15, right: 15, 
                background: 'rgba(0,0,0,0.05)', border: 'none', 
                borderRadius: '50%', width: 36, height: 36, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                cursor: 'pointer', color: 'var(--text-main)', 
                zIndex: 10, transition: 'all 0.2s' 
              }}
            >
              <X size={18} />
            </button>

            <div style={{marginBottom: '28px', textAlign: 'center'}}>
                <div style={{width: 54, height: 54, background: 'var(--success-soft)', color: 'var(--success)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px'}}>
                    <CheckCircle size={28} />
                </div>
                <h2 style={{margin: 0, color: 'var(--text-main)', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.02em'}}>Thông tin thanh toán</h2>
                <p style={{color: 'var(--text-light)', marginTop: '6px', fontSize: '15px'}}>Đơn hàng của bạn đã được ghi nhận. Vui lòng thanh toán để hoàn tất.</p>
            </div>

            <div style={{
                background: 'var(--bg-muted)', borderRadius: '32px', padding: '32px', marginBottom: '28px',
                border: '1px solid var(--border-color)', position: 'relative',
                boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.02)'
            }}>
                <div style={{textAlign: 'center'}}>
                    <div style={{
                        background: 'white', padding: '24px', borderRadius: '24px', 
                        display: 'inline-block', boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(0,0,0,0.05)', position: 'relative'
                    }}>
                        <img 
                            src={paymentMethod === 'TRANSFER' 
                                ? `https://img.vietqr.io/image/${SHOP_PAYMENT_CONFIG.bank.id}-${SHOP_PAYMENT_CONFIG.bank.accountNo}-compact2.png?amount=${createdOrder.amount}&addInfo=${encodeURIComponent(`HXH ORDER ${createdOrder.id}`)}&accountName=${encodeURIComponent(SHOP_PAYMENT_CONFIG.bank.accountName)}`
                                : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=2|99|${SHOP_PAYMENT_CONFIG.momo.phoneNumber}|${encodeURIComponent(SHOP_PAYMENT_CONFIG.momo.accountName)}|empty|0|0|${createdOrder.amount}|HXH_ORDER_${createdOrder.id}`
                            }
                            alt="Payment QR" 
                            style={{ width: '240px', height: '240px', objectFit: 'contain' }} 
                        />
                        <div style={{
                            position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)',
                            background: 'white', padding: '4px 12px', borderRadius: '20px',
                            fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)',
                            border: '1px solid var(--border-color)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                        }}>
                            {paymentMethod === 'TRANSFER' ? 'VIETQR / NAPAS 247' : 'MOMO WALLET'}
                        </div>
                    </div>
                    
                    <div style={{marginTop: '32px', display: 'flex', justifyContent: 'center'}}>
                         {paymentMethod === 'TRANSFER' && selectedPayerBank && (
                            <a 
                                href={`vietqr://bank/${selectedPayerBank.id}?amount=${createdOrder.amount}&addInfo=${encodeURIComponent(`HXH ORDER ${createdOrder.id}`)}`} 
                                className="btn-primary" 
                                style={{
                                  fontSize: '14px', padding: '14px 28px', borderRadius: '50px', 
                                  display: 'flex', alignItems: 'center', gap: '10px', 
                                  boxShadow: '0 10px 25px var(--primary-soft)',
                                  fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase'
                                }}
                            >
                                <Landmark size={18} /> Mở App {selectedPayerBank.name}
                            </a>
                         )}
                    </div>
                </div>

                <div style={{
                    marginTop: '32px', textAlign: 'left', display: 'grid', gap: '1px', 
                    background: 'var(--border-color)', borderRadius: '24px', overflow: 'hidden',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{background: 'var(--bg-light)', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span style={{color: 'var(--text-light)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em'}}>SỐ TÀI KHOẢN</span>
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                            <strong style={{fontSize: '17px', color: 'var(--text-main)', letterSpacing: '0.5px'}}>{paymentMethod === 'TRANSFER' ? SHOP_PAYMENT_CONFIG.bank.accountNo : SHOP_PAYMENT_CONFIG.momo.phoneNumber}</strong>
                            <button 
                                onClick={() => copyToClipboard(paymentMethod === 'TRANSFER' ? SHOP_PAYMENT_CONFIG.bank.accountNo : SHOP_PAYMENT_CONFIG.momo.phoneNumber, 'số tài khoản')}
                                style={{background: 'var(--bg-muted)', border: 'none', width: 32, height: 32, borderRadius: '8px', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                            >
                                <Copy size={15} />
                            </button>
                        </div>
                    </div>
                    <div style={{background: 'var(--bg-light)', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span style={{color: 'var(--text-light)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em'}}>CHỦ TÀI KHOẢN</span>
                        <strong style={{fontSize: '14px', color: 'var(--text-main)', fontWeight: 700}}>{paymentMethod === 'TRANSFER' ? SHOP_PAYMENT_CONFIG.bank.accountName : SHOP_PAYMENT_CONFIG.momo.accountName}</strong>
                    </div>
                    <div style={{background: 'var(--bg-light)', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span style={{color: 'var(--text-light)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em'}}>NỘI DUNG</span>
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                            <strong style={{fontSize: '14px', color: 'var(--primary)', fontWeight: 800}}>{`HXH ORDER ${createdOrder.id}`}</strong>
                            <button 
                                onClick={() => copyToClipboard(`HXH ORDER ${createdOrder.id}`, 'nội dung')}
                                style={{background: 'var(--bg-muted)', border: 'none', width: 32, height: 32, borderRadius: '8px', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                            >
                                <Copy size={15} />
                            </button>
                        </div>
                    </div>
                    <div style={{background: 'var(--primary-soft)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span style={{color: 'var(--primary)', fontSize: '13px', fontWeight: 700}}>TỔNG THANH TOÁN</span>
                        <strong style={{fontSize: '24px', color: 'var(--primary)', fontWeight: 900, letterSpacing: '-0.02em'}}>{createdOrder.amount.toLocaleString()}đ</strong>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleFinishPayment} 
                className="btn-primary" 
                style={{
                  width: '100%', padding: '20px', borderRadius: '20px', fontWeight: 800, fontSize: '16px',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', 
                  marginBottom: '16px', boxShadow: '0 12px 30px var(--primary-soft)'
                }}
            >
                Tôi Đã Chuyển Khoản <ArrowRight size={22} />
            </button>

            <button 
                onClick={() => setShowQRModal(false)} 
                style={{width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 600, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px'}}
            >
                Quay lại chọn phương thức khác
            </button>
        </div>
    </div>
  );
}
