import { useState, useMemo } from 'react';
import { authAPI } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { ButtonLoading } from '../components/LoadingSpinner';
import { User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, Check, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Tính toán mức độ mạnh yếu của mật khẩu
  const passwordStrength = useMemo(() => {
    const pw = formData.password;
    if (!pw) return 0;
    
    let score = 0;
    if (pw.length >= 6) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[a-z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;
    
    return score;
  }, [formData.password]);

  const strengthLabel = [
    { text: 'Rất yếu', color: '#e53e3e', width: '20%' },
    { text: 'Yếu', color: '#dd6b20', width: '40%' },
    { text: 'Trung bình', color: '#d69e2e', width: '60%' },
    { text: 'Mạnh', color: '#3182ce', width: '80%' },
    { text: 'Rất mạnh', color: '#38a169', width: '100%' }
  ];

  const currentStrength = passwordStrength > 0 ? strengthLabel[passwordStrength - 1] : null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (formData.password.length < 6) {
      setFormError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    
    if (passwordStrength < 3) {
      setFormError('Vui lòng chọn mật khẩu mạnh hơn để đảm bảo bảo mật.');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register(formData);
      if (res.data.success) {
        navigate('/login');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-slide-up" style={{ maxWidth: 500 }}>
        <div className="auth-header">
          <h2>Tạo Tài Khoản</h2>
          <p style={{ color: 'var(--text-light)' }}>Trải nghiệm dịch vụ bánh ngọt cao cấp tại HXH Bakery</p>
        </div>

        {formError && (
          <div
            className="auth-inline-error"
            role="alert"
            style={{
              marginBottom: 16,
              padding: '12px 14px',
              borderRadius: 12,
              background: 'var(--danger-soft)',
              border: '1px solid rgba(229, 62, 62, 0.2)',
              color: 'var(--danger)',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={18} />
            {formError}
          </div>
        )}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-field">
            <label className="form-field__label">Họ và tên</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input 
                type="text" 
                name="fullname" 
                placeholder="Nhập họ và tên"
                className="form-field__input" 
                style={{ paddingLeft: 42 }}
                value={formData.fullname} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-field__label">Địa chỉ Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input 
                type="email" 
                name="email" 
                placeholder="email@example.com"
                className="form-field__input" 
                style={{ paddingLeft: 42 }}
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-field__label">Số điện thoại</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input 
                type="tel" 
                name="phone" 
                placeholder="Nhập số điện thoại"
                className="form-field__input" 
                style={{ paddingLeft: 42 }}
                value={formData.phone} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-field__label">Mật khẩu bảo mật</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="Tối thiểu 6 ký tự"
                className="form-field__input" 
                style={{ paddingLeft: 42, paddingRight: 42 }}
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 4
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={14} color={currentStrength?.color} />
                    Độ mạnh mật khẩu: 
                    <strong style={{ color: currentStrength?.color }}> {currentStrength?.text}</strong>
                  </span>
                </div>
                <div style={{ height: 4, width: '100%', background: 'var(--bg-muted)', borderRadius: 2, overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: currentStrength?.width, 
                      background: currentStrength?.color, 
                      transition: 'width 0.3s ease, background 0.3s ease' 
                    }} 
                  />
                </div>
                <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 10px' }}>
                  <li style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: formData.password.length >= 6 ? '#38a169' : 'var(--text-light)' }}>
                    {formData.password.length >= 6 ? <Check size={10} /> : <div style={{width: 10, height: 1}} />} Tối thiểu 6 ký tự
                  </li>
                  <li style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: /[A-Z]/.test(formData.password) ? '#38a169' : 'var(--text-light)' }}>
                    {/[A-Z]/.test(formData.password) ? <Check size={10} /> : <div style={{width: 10, height: 1}} />} Có chữ hoa
                  </li>
                  <li style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: /[0-9]/.test(formData.password) ? '#38a169' : 'var(--text-light)' }}>
                    {/[0-9]/.test(formData.password) ? <Check size={10} /> : <div style={{width: 10, height: 1}} />} Có chữ số
                  </li>
                  <li style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: /[^A-Za-z0-9]/.test(formData.password) ? '#38a169' : 'var(--text-light)' }}>
                    {/[^A-Za-z0-9]/.test(formData.password) ? <Check size={10} /> : <div style={{width: 10, height: 1}} />} Ký tự đặc biệt
                  </li>
                </ul>
              </div>
            )}
          </div>

          <ButtonLoading isLoading={loading} className="btn btn--primary btn--block btn--lg" style={{ marginTop: 20 }}>
            Đăng Ký Tài Khoản
          </ButtonLoading>
        </form>

        <div className="auth-footer">
          Đã có tài khoản? <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>Đăng nhập ngay</Link>
          <div style={{ marginTop: 20 }}>
            <Link to="/" style={{ color: 'var(--text-light)', fontWeight: 'normal' }}>
              ← Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
