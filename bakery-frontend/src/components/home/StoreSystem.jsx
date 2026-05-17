import { motion } from 'framer-motion';
import { MapPin, Phone, Clock } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function StoreSystem({ reduceMotion, headingLevel = 'h2', compact = false }) {
  const address = "58 đường số 8 phường Linh Trung TP.Thủ Đức";
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const headingStyle = { textAlign: 'left', marginBottom: 8, fontSize: '32px' };

  return (
    <section id="stores" className="section-stores" style={{ padding: compact ? '48px 0 80px' : '72px 0', background: 'var(--bg-main)' }}>
      <div className="container">
        <motion.div
          style={{ marginBottom: 32 }}
          variants={reduceMotion ? undefined : fadeUp}
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, margin: '-40px' }}
        >
          {headingLevel === 'h1' ? (
            <h1 className="section-title-new" style={headingStyle}>Hệ thống cửa hàng</h1>
          ) : (
            <h2 className="section-title-new" style={headingStyle}>Hệ thống cửa hàng</h2>
          )}
          <p style={{ color: 'var(--text-light)', fontSize: 16 }}>1 cửa hàng trên toàn hệ thống</p>
        </motion.div>

        <motion.div 
          className="store-system-layout"
          variants={reduceMotion ? undefined : fadeUp}
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, margin: '-40px' }}
        >
          <div className="store-map-container">
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '16px', backgroundColor: '#e9e5df' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bản đồ cửa hàng"
            />
          </div>

          <div className="store-list-container">
            <div className="store-card-item">
              <div className="store-card-item__icon">
                <MapPin size={22} />
              </div>
              <div className="store-card-item__info">
                <h3 className="store-card-item__title">HXH Bakery – Thủ Đức</h3>
                <p className="store-card-item__address">{address}</p>
                <div className="store-card-item__meta">
                  <span><Phone size={16} color="var(--primary)" /> 090 123 4567</span>
                  <span><Clock size={16} /> 8:00 - 22:00</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
