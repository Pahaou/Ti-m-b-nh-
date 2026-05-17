import { MapPin, Plus, Trash2 } from 'lucide-react';
import { ButtonLoading } from '../LoadingSpinner';

export default function AddressBook({ addresses, newAddrStr, setNewAddrStr, onAdd, onDelete, isAdding }) {
  return (
    <div style={{ background: 'var(--bg-light)', padding: 30, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', height: '100%' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, color: 'var(--text-main)', fontWeight: 700 }}>
        <MapPin size={20} /> Sổ địa chỉ
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginBottom: 30 }}>
        {addresses && addresses.map(a => (
          <div key={a.id} style={{ padding: 15, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>{a.receiver_name} | {a.receiver_phone}</strong>
              <p style={{ color: 'var(--text-light)', marginTop: 5 }}>{a.address_detail}</p>
              {a.is_default === 1 && (
                <span style={{ fontSize: 12, background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 4, marginTop: 5, display: 'inline-block', fontWeight: 600 }}>
                  Mặc định
                </span>
              )}
            </div>
            <button 
              onClick={() => onDelete(a.id)} 
              style={{ background: 'none', color: 'var(--danger)', padding: 10, border: 'none', cursor: 'pointer' }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {(!addresses || addresses.length === 0) && <p style={{ color: 'var(--text-muted)' }}>Bạn chưa lưu địa chỉ nào.</p>}
      </div>

      <form onSubmit={onAdd} style={{ borderTop: '1px dashed var(--border-color)', paddingTop: 20 }}>
        <div className="form-group">
          <label style={{ color: 'var(--text-main)', fontWeight: 600 }}>Thêm địa chỉ mới</label>
          <textarea 
            rows="2" 
            value={newAddrStr} 
            onChange={(e) => setNewAddrStr(e.target.value)} 
            className="form-control" 
            placeholder="Nhập địa chỉ nhà, phường/xã, quận, tỉnh..." 
            required 
            style={{ background: 'var(--bg-light)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
          />
        </div>
        <ButtonLoading isLoading={isAdding} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Plus size={16} /> Thêm vào sổ
        </ButtonLoading>
      </form>
    </div>
  );
}
