import { SUPPORTED_BANKS } from '../config/payment';

export default function BankSelector({ selectedBank, onSelect }) {
  return (
    <div style={{ marginTop: '20px' }}>
      <label style={{ fontSize: '14px', color: '#666', marginBottom: '12px', display: 'block', fontWeight: 600 }}>
        Chọn ứng dụng ngân hàng của bạn để mở nhanh:
      </label>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
        gap: '12px'
      }}>
        {SUPPORTED_BANKS.map(bank => (
          <div 
            key={bank.id}
            onClick={() => onSelect(bank)}
            style={{
              padding: '10px',
              border: `2px solid ${selectedBank?.id === bank.id ? 'var(--primary)' : '#f1f1f1'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              background: selectedBank?.id === bank.id ? 'rgba(230, 80, 17, 0.05)' : 'white',
              boxShadow: selectedBank?.id === bank.id ? '0 4px 12px rgba(230, 80, 17, 0.1)' : 'none'
            }}
          >
            <img src={bank.logo} alt={bank.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain' }} />
            <span style={{ fontSize: '10px', fontWeight: 600, textAlign: 'center', color: '#555' }}>{bank.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
