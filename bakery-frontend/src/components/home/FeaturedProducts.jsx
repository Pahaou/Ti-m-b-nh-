import { motion } from 'framer-motion';
import ProductCard from '../ProductCard';
import { ProductSkeleton } from '../LoadingSpinner';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } };

export default function FeaturedProducts({ products, loading, reduceMotion }) {
  return (
    <section className="section-featured" id="featured">
      <div className="container">
        <motion.div
          className="section-header"
          variants={reduceMotion ? undefined : fadeUp}
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, margin: '-40px' }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <h2 className="section-title-new" style={{ margin: 0 }}>Sản phẩm nổi bật</h2>
          <Link to="/products" className="link-see-more">
            Xem tất cả <span className="arrow">›</span>
          </Link>
        </motion.div>

        {loading && (!products || products.length === 0) ? (
          <div className="featured-grid">
            {[...Array(5)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : products && products.length > 0 ? (
          <motion.div
            className="featured-grid"
            variants={reduceMotion ? undefined : stagger}
            initial={reduceMotion ? false : 'hidden'}
            whileInView={reduceMotion ? undefined : 'show'}
            viewport={{ once: true, margin: '-30px' }}
          >
            {products.map((item) => (
              <motion.div key={item.id} variants={reduceMotion ? undefined : fadeUp}>
                <ProductCard item={item} compact />
              </motion.div>
            ))}
          </motion.div>
        ) : !loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-light)' }}>
            Chưa có sản phẩm nổi bật nào.
          </div>
        )}
      </div>
    </section>
  );
}
