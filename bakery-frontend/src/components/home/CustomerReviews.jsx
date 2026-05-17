import { motion } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } };

const REVIEWS = [
  { name: 'Nguyễn Thị Mai', avatar: 'M', rating: 5, text: 'Bánh rất ngon, kem tươi béo vừa phải. Giao hàng nhanh, đóng gói đẹp. Sẽ ủng hộ tiếp!', date: '2 ngày trước' },
  { name: 'Trần Văn Hùng', avatar: 'H', rating: 5, text: 'Đặt bánh sinh nhật cho vợ, thiết kế đúng yêu cầu. Cả nhà ai cũng khen ngon.', date: '5 ngày trước' },
  { name: 'Lê Phương Anh', avatar: 'A', rating: 4, text: 'Mousse chanh dây rất thơm mát. Giá hơi cao nhưng chất lượng xứng đáng.', date: '1 tuần trước' },
  { name: 'Phạm Hoàng Long', avatar: 'L', rating: 5, text: 'Combo tiết kiệm rất hời, đặt cho cả team ăn sáng. Bánh mì giòn tan!', date: '2 tuần trước' },
];

export default function CustomerReviews({ reduceMotion }) {
  return (
    <section style={{ padding: '72px 0', background: 'var(--bg-muted)', borderBlock: '1px solid var(--border-color)' }}>
      <div className="container">
        <motion.div
          style={{ textAlign: 'center', marginBottom: 48 }}
          variants={reduceMotion ? undefined : fadeUp}
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, margin: '-40px' }}
        >
          <h2 className="section-title-new" style={{ marginBottom: 8 }}>Khách hàng nói gì?</h2>
          <p style={{ color: 'var(--text-light)', fontSize: 15 }}>Hàng nghìn khách hàng tin tưởng lựa chọn</p>
        </motion.div>

        <motion.div
          className="reviews-grid"
          variants={reduceMotion ? undefined : stagger}
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, margin: '-30px' }}
        >
          {REVIEWS.map((review, i) => (
            <motion.div key={i} className="review-card" variants={reduceMotion ? undefined : fadeUp}>
              <div className="review-card__header">
                <div className="review-card__avatar">{review.avatar}</div>
                <div>
                  <p className="review-card__name">{review.name}</p>
                  <div className="review-card__stars">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} size={14} style={{ color: s < review.rating ? '#d4a574' : 'var(--border-color)', fill: s < review.rating ? '#d4a574' : 'none' }} />
                    ))}
                  </div>
                </div>
              </div>
              <MessageSquare size={20} style={{ color: 'var(--primary)', opacity: 0.3, marginBottom: 8 }} />
              <p className="review-card__text">{review.text}</p>
              <span className="review-card__date">{review.date}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
