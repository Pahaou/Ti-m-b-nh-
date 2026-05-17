import { CreditCard, CheckCircle, Banknote, QrCode, Wallet, Landmark } from 'lucide-react';
import BankSelector from '../BankSelector';

export default function PaymentMethods({ 
  paymentMethod, 
  setPaymentMethod, 
  selectedPayerBank, 
  setSelectedPayerBank 
}) {
  const methods = [
    { id: 'COD', name: 'Thanh toán COD', desc: 'Trả tiền khi nhận hàng', icon: <Banknote size={24}/>, color: '#10b981' },
    { id: 'TRANSFER', name: 'Chuyển khoản', desc: 'VietQR / Napas 247', icon: <QrCode size={24}/>, color: '#f59e0b' },
    { id: 'MOMO', name: 'Ví MoMo', desc: 'Thanh toán siêu nhanh', icon: <Wallet size={24}/>, color: '#a21caf' },
    { id: 'VNPAY', name: 'Cổng VNPay', desc: 'ATM / QR-VNPay', icon: <Landmark size={24}/>, color: '#1d4ed8' }
  ];

  return (
    <div style={{background: 'var(--bg-light)', padding: '30px', borderRadius: '24px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px'}}>
        <div style={{background: 'var(--primary-soft)', color: 'var(--primary)', width: 48, height: 48, borderRadius: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <CreditCard size={24} />
        </div>
        <h3 style={{fontSize: '22px', margin: 0, color: 'var(--text-main)', fontWeight: 800}}>Phương thức thanh toán</h3>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px'}}>
        {methods.map(method => (
          <div 
            key={method.id}
            onClick={() => setPaymentMethod(method.id)}
            style={{
              padding: '24px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              border: `2px solid ${paymentMethod === method.id ? method.color : 'var(--border-color)'}`,
              background: paymentMethod === method.id ? `${method.color}08` : 'white',
              display: 'flex', gap: '16px', position: 'relative',
              boxShadow: paymentMethod === method.id ? `0 10px 25px ${method.color}15` : 'none',
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center',
              background: paymentMethod === method.id ? method.color : 'var(--bg-muted)',
              color: paymentMethod === method.id ? 'white' : method.color,
              transition: 'all 0.3s ease'
            }}>
              {method.icon}
            </div>
            <div style={{flex: 1}}>
              <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)', fontWeight: 800 }}>{method.name}</h4>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-light)', fontWeight: 500 }}>{method.desc}</p>
            </div>
            
            {paymentMethod === method.id && (
              <div style={{
                position: 'absolute', top: 12, right: 12, width: 22, height: 22, 
                background: method.color, borderRadius: '50%', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <CheckCircle size={14} />
              </div>
            )}
          </div>
        ))}
      </div>

      {paymentMethod === 'TRANSFER' && (
        <div style={{
          marginTop: '24px', padding: '24px', background: 'var(--bg-muted)', 
          borderRadius: '24px', border: '1px solid var(--border-color)',
          animation: 'fadeInUp 0.4s ease'
        }}>
          <h4 style={{fontSize: '15px', marginBottom: '16px', color: 'var(--text-main)', fontWeight: 700}}>Chọn ngân hàng của bạn để thanh toán</h4>
          <BankSelector selectedBank={selectedPayerBank} onSelect={setSelectedPayerBank} />
        </div>
      )}
    </div>
  );
}
