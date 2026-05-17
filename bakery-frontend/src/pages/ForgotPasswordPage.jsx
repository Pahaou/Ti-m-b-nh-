import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { ButtonLoading } from '../components/LoadingSpinner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { showSuccess } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Giả lập gửi yêu cầu đến server
    setTimeout(() => {
      setLoading(false);
      setIsSent(true);
      showSuccess('Yêu cầu đã được gửi! Vui lòng kiểm tra email của bạn. 📧');
    }, 1500);
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-slide-up">
        <div className="auth-header">
          <h2>Quên Mật Khẩu</h2>
          <p style={{color: '#888'}}>
            {!isSent 
              ? 'Nhập email của bạn để nhận hướng dẫn khôi phục mật khẩu.' 
              : 'Chúng tôi đã gửi hướng dẫn hỗ trợ đến email của bạn.'}
          </p>
        </div>
        
        {!isSent ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email của bạn</label>
              <input 
                type="email" 
                placeholder="Ví dụ: khachhang@gmail.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="form-control" 
                required 
              />
            </div>
            
            <ButtonLoading isLoading={loading} className="btn-primary" style={{width: '100%', marginTop: '10px'}}>
              Gửi Yêu Cầu
            </ButtonLoading>
          </form>
        ) : (
          <div style={{textAlign: 'center', padding: '20px 0'}}>
            <div style={{fontSize: '50px', marginBottom: '15px'}}>📧</div>
            <p style={{lineHeight: 1.6, color: '#555', marginBottom: '20px'}}>
              Một liên kết khôi phục mật khẩu đã được gửi đến <strong>{email}</strong>. 
              Vui lòng kiểm tra cả hòm thư rác (spam) nếu bạn không tìm thấy.
            </p>
            <button onClick={() => setIsSent(false)} className="btn-outline" style={{width: '100%'}}>
              Thử lại với email khác
            </button>
          </div>
        )}

        <div className="auth-footer" style={{marginTop: 30}}>
          <Link to="/login" style={{color: 'var(--primary)', fontWeight: 600}}>Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
