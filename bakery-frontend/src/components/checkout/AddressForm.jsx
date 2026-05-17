import { MapPin, FileText } from 'lucide-react';

export default function AddressForm({ 
  addresses, 
  selectedAddress, 
  setSelectedAddress, 
  newName, 
  setNewName, 
  newPhone, 
  setNewPhone, 
  newAddressDetail, 
  setNewAddressDetail,
  deliveryDate,
  setDeliveryDate,
  deliveryTime,
  setDeliveryTime,
  cakeMessage,
  setCakeMessage,
  note,
  setNote
}) {
  return (
    <div style={{background: 'var(--bg-light)', padding: '30px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px'}}>
        <div style={{background: 'var(--primary-soft)', color: 'var(--primary)', padding: '10px', borderRadius: '12px'}}>
           <MapPin size={24} />
        </div>
        <h3 style={{fontSize: '20px', margin: 0, color: 'var(--text-main)', fontWeight: 800}}>Thông tin giao hàng</h3>
      </div>

      {addresses.length > 0 && (
        <div className="form-group" style={{marginBottom: '20px'}}>
          <label style={{fontSize: '14px', color: 'var(--text-main)', marginBottom: '8px', display: 'block', fontWeight: 600}}>Địa chỉ đã lưu</label>
          <select 
            className="form-control" 
            value={selectedAddress} 
            onChange={e => { setSelectedAddress(e.target.value); setNewName(''); setNewPhone(''); setNewAddressDetail(''); }}
            style={{padding: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-muted)', color: 'var(--text-main)'}}
          >
            <option value="">-- Chọn một địa chỉ --</option>
            {addresses.map(a => (
              <option key={a.id} value={`${a.receiver_name} - ${a.receiver_phone} - ${a.address_detail}`}>
                {a.receiver_name} | {a.address_detail}
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
        <label style={{fontSize: '14px', color: 'var(--text-main)', marginBottom: '-5px', display: 'block', fontWeight: 600}}>Hoặc giao đến địa chỉ mới</label>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
          <input 
            type="text"
            className="form-control" 
            placeholder="Họ và tên"
            value={newName}
            onChange={e => { setNewName(e.target.value); setSelectedAddress(''); }}
            style={{padding: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-muted)', color: 'var(--text-main)', borderRadius: '12px'}}
          />
          <input 
            type="tel"
            className="form-control" 
            placeholder="Số điện thoại"
            value={newPhone}
            onChange={e => { setNewPhone(e.target.value); setSelectedAddress(''); }}
            style={{padding: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-muted)', color: 'var(--text-main)', borderRadius: '12px'}}
          />
        </div>
        <textarea 
          className="form-control" 
          rows="2" 
          placeholder="Địa chỉ chi tiết (Số nhà, tên đường, phường/xã...)"
          value={newAddressDetail}
          onChange={e => { setNewAddressDetail(e.target.value); setSelectedAddress(''); }}
          style={{padding: '12px', border: '1px solid var(--border-color)', resize: 'none', background: 'var(--bg-muted)', color: 'var(--text-main)', borderRadius: '12px'}}
        ></textarea>
      </div>

      <div className="form-group" style={{marginTop: '20px'}}>
        <label style={{fontSize: '14px', color: 'var(--text-main)', marginBottom: '8px', display: 'block', fontWeight: 600}}>Thời gian nhận bánh</label>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
          <input
            type="date"
            className="form-control"
            value={deliveryDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={e => setDeliveryDate(e.target.value)}
            style={{padding: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-muted)', color: 'var(--text-main)', borderRadius: '12px'}}
            required
          />
          <input
            type="time"
            className="form-control"
            value={deliveryTime}
            onChange={e => setDeliveryTime(e.target.value)}
            style={{padding: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-muted)', color: 'var(--text-main)', borderRadius: '12px'}}
            required
          />
        </div>
        <p style={{fontSize: '12px', color: 'var(--text-muted)', margin: '8px 0 0'}}>
          Bánh sinh nhật và bánh cần trang trí nên đặt trước ít nhất 4 giờ.
        </p>
      </div>

      <div className="form-group" style={{marginTop: '20px'}}>
        <label style={{fontSize: '14px', color: 'var(--text-main)', marginBottom: '8px', display: 'block', fontWeight: 600}}>Lời nhắn trên bánh (Tùy chọn)</label>
        <input
          type="text"
          className="form-control"
          placeholder="Ví dụ: Chúc mừng sinh nhật An"
          value={cakeMessage}
          onChange={e => setCakeMessage(e.target.value)}
          maxLength={80}
          style={{padding: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-muted)', color: 'var(--text-main)', borderRadius: '12px'}}
        />
      </div>

      <div className="form-group" style={{marginTop: '20px'}}>
        <label style={{fontSize: '14px', color: 'var(--text-main)', marginBottom: '8px', display: 'block', fontWeight: 600}}>Ghi chú (Tùy chọn)</label>
        <div style={{position: 'relative'}}>
           <FileText size={16} style={{position: 'absolute', top: '15px', left: '15px', color: 'var(--text-muted)'}} />
           <textarea 
            className="form-control" 
            rows="2" 
            placeholder="Bạn có yêu cầu gì thêm không?"
            value={note}
            onChange={e => setNote(e.target.value)}
            style={{padding: '12px 12px 12px 40px', border: '1px solid var(--border-color)', resize: 'none', minHeight: '80px', background: 'var(--bg-light)', color: 'var(--text-main)'}}
          ></textarea>
        </div>
      </div>
    </div>
  );
}
