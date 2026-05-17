import { Lock } from 'lucide-react';
import { ButtonLoading } from '../LoadingSpinner';

export default function ChangePasswordForm({ currentPassword, setCurrentPassword, newPassword, setNewPassword, onSubmit, isLoading }) {
  return (
    <div style={{ background: 'var(--bg-light)', padding: 30, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, color: 'var(--text-main)', fontWeight: 700 }}>
        <Lock size={20} /> Đổi mật khẩu
      </h3>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label style={{ color: 'var(--text-main)', fontWeight: 600 }}>Mật khẩu hiện tại</label>
          <input 
            type="password" 
            value={currentPassword} 
            onChange={(e) => setCurrentPassword(e.target.value)} 
            className="form-control" 
            required 
            style={{ background: 'var(--bg-light)', color: 'var(--text-main)' }}
          />
        </div>
        <div className="form-group">
          <label style={{ color: 'var(--text-main)', fontWeight: 600 }}>Mật khẩu mới</label>
          <input 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            className="form-control" 
            required 
            style={{ background: 'var(--bg-light)', color: 'var(--text-main)' }}
          />
        </div>
        <ButtonLoading isLoading={isLoading} className="btn-outline" style={{ width: '100%' }}>Cập nhật mật khẩu</ButtonLoading>
      </form>
    </div>
  );
}
