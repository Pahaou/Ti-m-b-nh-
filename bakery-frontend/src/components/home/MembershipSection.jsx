import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronDown, ArrowRight } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const FAQ_ITEMS = [
  { q: 'Làm sao để thành thành viên?', a: 'Bạn chỉ cần đăng ký tài khoản trên website hoặc ứng dụng. Sau khi đăng ký thành công, bạn tự động trở thành thành viên và bắt đầu tích điểm từ đơn hàng đầu tiên.' },
  { q: 'Cách tích điểm như thế nào?', a: 'Mỗi 10.000đ trong đơn hàng bạn sẽ nhận được 1 điểm thưởng. Điểm thưởng được cộng tự động sau khi đơn hàng hoàn thành.' },
  { q: 'Điểm thưởng có thời hạn không?', a: 'Điểm thưởng sẽ được reset hàng năm. Bạn nên sử dụng điểm đổi voucher thường xuyên để không bị hết hạn.' },
  { q: 'Tôi có thể đổi điểm thành gì?', a: 'Bạn có thể đổi điểm lấy voucher giảm giá, quà tặng bánh miễn phí, hoặc ưu đãi miễn phí giao hàng.' },
  { q: 'Làm sao để lên hạng thành viên?', a: 'Hạng thành viên được xét dựa trên tổng chi tiêu trong năm. Bạn hàng Silver (từ 1 triệu), Gold (từ 3 triệu), Platinum (từ 5 triệu).' },
];

export default function MembershipSection({ reduceMotion }) {
  const { user } = useContext(AuthContext);
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section className="section-membership" id="membership">
      <div className="container">
        <motion.div
          className="membership-cta"
          variants={reduceMotion ? undefined : fadeUp}
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, margin: '-40px' }}
        >
          <h2 className="membership-cta__title">
            {user ? (user.role === 'admin' ? `Chào Sếp Tổng!` : `Chào ${user.fullname}!`) : 'Bạn là thành viên?'}
          </h2>
          <p className="membership-cta__sub">
            {user 
              ? (user.role === 'admin' 
                  ? 'Quản lý các chương trình ưu đãi và điểm thưởng của cửa hàng tại đây.' 
                  : 'Xem điểm tích lũy và đổi những phần quà hấp dẫn ngay')
              : 'Đăng nhập để xem giá ưu đãi và tích điểm'}
          </p>
          <Link to={user ? (user.role === 'admin' ? "/admin" : "/membership") : "/login"} className="btn-membership-cta">
            {user 
              ? (user.role === 'admin' ? 'Quản trị hệ thống' : 'Xem điểm & Đổi quà') 
              : 'Đăng nhập & Đặt hàng'} <ArrowRight size={18} />
          </Link>
        </motion.div>

        <motion.div
          className="membership-faq"
          variants={reduceMotion ? undefined : fadeUp}
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, margin: '-40px' }}
        >
          <div className="faq-header">
            <Users size={20} style={{ color: 'var(--primary)' }} />
            <div>
              <p className="faq-header__title">Quyền lợi thành viên</p>
              <p className="faq-header__sub">Nâng hạng để nhận nhiều ưu đãi hơn</p>
            </div>
          </div>

          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className={`faq-item ${openIdx === i ? 'open' : ''}`}>
              <button
                className="faq-item__question"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                aria-expanded={openIdx === i}
              >
                <span>{item.q}</span>
                <ChevronDown size={18} className={`faq-item__chevron ${openIdx === i ? 'rotated' : ''}`} />
              </button>
              <AnimatePresence>
                {openIdx === i && (
                  <motion.div
                    className="faq-item__answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p>{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
