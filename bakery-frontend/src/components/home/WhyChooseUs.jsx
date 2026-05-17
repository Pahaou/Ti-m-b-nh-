import { motion } from 'framer-motion';
import { Sparkles, Clock, Truck, ShieldCheck } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } };

const WHY_ITEMS = [
  { icon: Sparkles, title: 'Nguyên liệu cao cấp', desc: 'Bơ Pháp, kem tươi nhập khẩu, bột mì hữu cơ từ châu Âu.' },
  { icon: Clock, title: 'Tươi mới mỗi ngày', desc: 'Bánh được nướng hàng ngày, đảm bảo thơm ngon nhất.' },
  { icon: Truck, title: 'Giao hàng nhanh', desc: 'Giao trong 2h nội thành, đóng gói cẩn thận giữ nguyên hình dáng.' },
  { icon: ShieldCheck, title: 'An toàn vệ sinh', desc: 'Đạt chuẩn ATTP, quy trình sản xuất sạch và minh bạch.' },
];

export default function WhyChooseUs({ reduceMotion }) {
  return (
    <section className="section-why" style={{ padding: '72px 0', background: 'var(--bg-light)' }}>
      <div className="container">
        <motion.div
          style={{ textAlign: 'center', marginBottom: 48 }}
          variants={reduceMotion ? undefined : fadeUp}
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, margin: '-40px' }}
        >
          <h2 className="section-title-new" style={{ marginBottom: 8 }}>Vì sao chọn HXH Bakery?</h2>
          <p style={{ color: 'var(--text-light)', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>Chúng tôi cam kết mang đến trải nghiệm tốt nhất</p>
        </motion.div>

        <motion.div
          className="why-grid"
          variants={reduceMotion ? undefined : stagger}
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, margin: '-30px' }}
        >
          {WHY_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i} className="why-card" variants={reduceMotion ? undefined : fadeUp}>
                <div className="why-card__icon">
                  <Icon size={28} />
                </div>
                <h3 className="why-card__title">{item.title}</h3>
                <p className="why-card__desc">{item.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
