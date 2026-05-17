import { useState } from 'react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const CONTACT_ITEMS = [
  { icon: Phone, title: 'Hotline', value: '090 123 4567' },
  { icon: Mail, title: 'Email', value: 'hi@hxhbakery.com' },
  { icon: MapPin, title: 'Địa chỉ', value: '58 Đường Số 8, Phường Linh Trung, TP. Thủ Đức' },
  { icon: Clock, title: 'Giờ mở cửa', value: '08:00 - 22:00 mỗi ngày' },
];

export default function ContactPage() {
  const { showSuccess } = useToast();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setForm({ name: '', phone: '', email: '', message: '' });
    showSuccess('Chức năng gửi liên hệ sẽ được cập nhật sau.');
  };

  return (
    <main className="page-container">
      <section className="container contact-page">
        <div className="contact-page__intro">
          <h1 className="section-title-new">Liên hệ</h1>
          <p>
            Liên hệ HXH Bakery để đặt bánh sinh nhật, bánh sự kiện hoặc cần hỗ trợ đơn hàng.
          </p>
        </div>

        <div className="contact-grid">
          {CONTACT_ITEMS.map((item) => {
            const ContactIcon = item.icon;
            return (
              <div className="contact-card" key={item.title}>
                <ContactIcon size={24} />
                <h3>{item.title}</h3>
                <p>{item.value}</p>
              </div>
            );
          })}
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Gửi lời nhắn</h2>
          <input value={form.name} onChange={handleChange('name')} placeholder="Họ tên" required />
          <input value={form.phone} onChange={handleChange('phone')} placeholder="Số điện thoại" required />
          <input value={form.email} onChange={handleChange('email')} placeholder="Email" type="email" />
          <textarea
            value={form.message}
            onChange={handleChange('message')}
            placeholder="Nội dung cần hỗ trợ"
            rows={5}
            required
          />
          <button type="submit" className="btn btn--primary">
            Gửi liên hệ
          </button>
        </form>
      </section>
    </main>
  );
}
