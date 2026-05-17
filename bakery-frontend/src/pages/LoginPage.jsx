import { useState, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ButtonLoading } from '../components/LoadingSpinner';
import { AlertCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react';

function safeNextPath(raw) {
  if (!raw || typeof raw !== 'string') return '/';
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/';
  return raw;
}

function useFormField(initialValue, validators = []) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const validate = useCallback((val) => {
    for (const fn of validators) {
      const msg = fn(val);
      if (msg) { setError(msg); return false; }
    }
    setError('');
    return true;
  }, [validators]);

  const handleChange = useCallback((e) => {
    const val = e.target.value;
    setValue(val);
    if (touched) validate(val);
  }, [touched, validate]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    validate(value);
  }, [value, validate]);

  return { value, error, touched, setValue, setError, handleChange, handleBlur, validate };
}

const isRequired = (msg) => (v) => v.trim() ? '' : msg;
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Email không hợp lệ';
const minLength = (n, msg) => (v) => v.length >= n ? '' : (msg || `Tối thiểu ${n} ký tự`);

export default function LoginPage() {
  const email = useFormField('', [isRequired('Vui lòng nhập email'), isEmail]);
  const password = useFormField('', [isRequired('Vui lòng nhập mật khẩu'), minLength(6, 'Mật khẩu tối thiểu 6 ký tự')]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = safeNextPath(searchParams.get('next'));

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError('');
    
    const emailValid = email.validate(email.value);
    const passValid = password.validate(password.value);
    if (!emailValid || !passValid) return;

    setLoading(true);
    try {
      const res = await authAPI.login({ email: email.value, password: password.value });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        if (res.data.user.role === 'admin') navigate('/admin');
        else navigate(nextPath);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Đăng Nhập</h2>
          <p style={{ color: 'var(--text-light)' }}>Chào mừng bạn trở lại với HXH Bakery</p>
        </div>

        {formError && (
          <div
            className="auth-inline-error"
            role="alert"
            style={{
              marginBottom: 16,
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--danger-soft)',
              border: '1px solid rgba(229, 62, 62, 0.25)',
              color: 'var(--danger)',
              fontSize: 14,
              lineHeight: 1.45,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            {formError}
          </div>
        )}

        <form onSubmit={handleLogin} noValidate>
          <div className="form-field">
            <label className="form-field__label">Email của bạn</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="email"
                placeholder="Ví dụ: khachhang@gmail.com"
                value={email.value}
                onChange={email.handleChange}
                onBlur={email.handleBlur}
                className={`form-field__input ${email.touched && email.error ? 'form-field__input--error' : ''}`}
                style={{ paddingLeft: 42 }}
                required
                autoComplete="email"
              />
            </div>
            {email.touched && email.error && (
              <div className="form-field__error">
                <AlertCircle size={13} /> {email.error}
              </div>
            )}
          </div>

          <div className="form-field">
            <label className="form-field__label">Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password.value}
                onChange={password.handleChange}
                onBlur={password.handleBlur}
                className={`form-field__input ${password.touched && password.error ? 'form-field__input--error' : ''}`}
                style={{ paddingLeft: 42, paddingRight: 42 }}
                required
                autoComplete="current-password"
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
            {password.touched && password.error && (
              <div className="form-field__error">
                <AlertCircle size={13} /> {password.error}
              </div>
            )}
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <ButtonLoading isLoading={loading} className="btn btn--primary btn--block btn--lg" style={{ marginTop: 8 }}>
            Đăng Nhập
          </ButtonLoading>
        </form>

        <div className="auth-footer">
          Chưa có tài khoản? <Link to="/register">Tạo tài khoản mới</Link>
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
