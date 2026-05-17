import { User } from 'lucide-react';
import { ButtonLoading } from '../LoadingSpinner';

export default function ProfileInfoForm({ profile, fullname, setFullname, phone, setPhone, onSubmit, isLoading }) {
  return (
    <div style={{ background: 'var(--bg-light)', padding: 30, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, color: 'var(--text-main)', fontWeight: 700 }}>
        <User size={20} /> Thông tin cá nhân
      </h3>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label style={{ color: 'var(--text-main)', fontWeight: 600 }}>Email (Không thể đổi)</label>
          <input 
            type="email" 
            value={profile?.email || ''} 
            className="form-control" 
            readOnly 
            style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }} 
          />
        </div>
        <div className="form-group">
          <label style={{ color: 'var(--text-main)', fontWeight: 600 }}>Họ và tên</label>
          <input 
            type="text" 
            value={fullname} 
            onChange={(e) => setFullname(e.target.value)} 
            className="form-control" 
            required 
            style={{ background: 'var(--bg-light)', color: 'var(--text-main)' }}
          />
        </div>
        <div className="form-group">
          <label style={{ color: 'var(--text-main)', fontWeight: 600 }}>Số điện thoại</label>
          <input 
            type="text" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            className="form-control" 
            style={{ background: 'var(--bg-light)', color: 'var(--text-main)' }}
          />
        </div>
        <ButtonLoading isLoading={isLoading} className="btn-primary" style={{ width: '100%' }}>Lưu thay đổi</ButtonLoading>
      </form>
    </div>
  );
}
