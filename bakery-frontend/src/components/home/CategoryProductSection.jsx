import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../ProductCard';
import { ProductSkeleton } from '../LoadingSpinner';
import { useProducts } from '../../hooks/useProducts';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } };

const SECTION_COLORS = ['var(--bg-muted)', 'var(--bg-light)', 'var(--bg-main)'];

export default function CategoryProductSection({ category, index, onViewAll }) {
  const { products, loading } = useProducts({ categoryId: category.id, limit: 4 });
  const reduceMotion = useReducedMotion();

  if (!loading && (!products || products.length === 0)) return null;

  return (
    <motion.section
      className="section-cat-products"
      style={{ background: SECTION_COLORS[index % SECTION_COLORS.length] }}
      initial={reduceMotion ? false : { opacity: 0 }}
      whileInView={reduceMotion ? undefined : { opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <div className="section-cat-products__header">
          <div>
            <h2 className="section-title-new">{category.name}</h2>
            {category.description && (
              <p className="section-cat-products__desc">{category.description}</p>
            )}
          </div>
          <button className="btn-view-all" onClick={() => onViewAll(String(category.id))}>
            Xem tất cả <ArrowRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="cat-products-grid">
            {[...Array(3)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : (
          <motion.div
            className="cat-products-grid"
            variants={reduceMotion ? undefined : stagger}
            initial={reduceMotion ? false : 'hidden'}
            whileInView={reduceMotion ? undefined : 'show'}
            viewport={{ once: true, margin: '-30px' }}
          >
            {(products || []).map((item) => (
              <motion.div key={item.id} variants={reduceMotion ? undefined : fadeUp}>
                <ProductCard item={item} compact />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
