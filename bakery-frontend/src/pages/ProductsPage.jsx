import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { ProductSkeleton } from '../components/LoadingSpinner';
import { useProducts } from '../hooks/useProducts';
import { useApi } from '../hooks/useApi';
import { productAPI } from '../services/api';

const SORT_OPTIONS = [
  { value: 'default', label: 'Nổi bật' },
  { value: 'popular', label: 'Xu hướng' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'price-asc', label: 'Giá thấp → cao' },
  { value: 'price-desc', label: 'Giá cao → thấp' },
  { value: 'name', label: 'Tên A–Z' },
];

const gridContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.052, delayChildren: 0.08 } },
};
const gridItemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};

export default function ProductsPage() {
  const [searchParams, setSearchParamsUrl] = useSearchParams();
  const initialCategoryId = searchParams.get('categoryId') || 'all';
  const initialQuery = searchParams.get('q') || '';
  const initialSort = searchParams.get('sort') || 'default';
  
  const reduceMotion = useReducedMotion();
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [debouncedQ, setDebouncedQ] = useState(initialQuery);
  const [sortBy, setSortBy] = useState(initialSort);
  const [activeCategory, setActiveCategory] = useState(initialCategoryId);

  const { execute: fetchCats, data: categoriesRes } = useApi(productAPI.getCategories);
  const categories = categoriesRes?.data || [];

  const { products, meta, loading, params, setParams, changePage } = useProducts({
    limit: 12,
    categoryId: initialCategoryId === 'all' ? undefined : initialCategoryId,
    q: initialQuery || undefined,
    sort: initialSort
  });

  useEffect(() => {
    fetchCats();
  }, [fetchCats]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchTerm.trim()), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    setParams({ 
      page: 1,
      q: debouncedQ || undefined, 
      sort: sortBy, 
      categoryId: activeCategory === 'all' ? undefined : activeCategory 
    });

    const nextParams = new URLSearchParams();

    if (activeCategory !== 'all') {
      nextParams.set('categoryId', activeCategory);
    }

    if (debouncedQ) {
      nextParams.set('q', debouncedQ);
    }

    if (sortBy !== 'default') {
      nextParams.set('sort', sortBy);
    }

    setSearchParamsUrl(nextParams, { replace: true });
  }, [debouncedQ, sortBy, activeCategory, setParams, setSearchParamsUrl]);

  // Sync state if URL changes directly
  useEffect(() => {
    const cid = searchParams.get('categoryId') || 'all';
    const q = searchParams.get('q') || '';
    const sort = searchParams.get('sort') || 'default';
    if (cid !== activeCategory) {
      setActiveCategory(cid);
    }
    if (q !== searchTerm) {
      setSearchTerm(q);
      setDebouncedQ(q);
    }
    if (sort !== sortBy) {
      setSortBy(sort);
    }
  }, [searchParams, activeCategory, searchTerm, sortBy]);

  const goPage = (p) => {
    changePage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-container">
      <section id="all-products" style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <motion.div
            style={{ marginBottom: 40 }}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <h1 className="section-title-new" style={{ textAlign: 'left', fontSize: 32 }}>Thực đơn</h1>
            <p style={{ color: 'var(--text-light)', fontSize: 15 }}>{meta.total || 0} sản phẩm</p>
          </motion.div>

          <div className="all-products-filters">
            <div className="all-products-filters__row">
              <div className="all-products-filters__search">
                <Search size={18} className="all-products-filters__search-icon" />
                <input
                  className="filter-input"
                  type="search"
                  placeholder="Tìm theo tên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ maxWidth: '100%' }}
                />
              </div>
              <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="category-tabs-row" style={{ overflowX: 'auto', paddingBottom: 16, marginBottom: 24, whiteSpace: 'nowrap' }}>
            <button type="button" className={`category-pill ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>
              Tất cả
            </button>
            {(categories || []).map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`category-pill ${activeCategory === String(cat.id) ? 'active' : ''}`}
                onClick={() => setActiveCategory(String(cat.id))}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="home-product-grid">
              {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (!products || products.length === 0) ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 16px', color: 'var(--text-light)' }}>
              Không có sản phẩm phù hợp. Thử bỏ bớt bộ lọc nhé.
            </p>
          ) : (
            <motion.div
              key={`grid-${params.page}-${activeCategory}-${sortBy}-${debouncedQ}`}
              className="home-product-grid"
              variants={reduceMotion ? undefined : gridContainerVariants}
              initial="hidden"
              animate="show"
            >
              {products.map((item) => (
                <ProductCard key={item.id} item={item} listVariants={reduceMotion ? undefined : gridItemVariants} />
              ))}
            </motion.div>
          )}

          {meta.totalPages > 1 && (
            <div className="pagination-bar">
              <button type="button" disabled={params.page <= 1} onClick={() => goPage(params.page - 1)}>Trước</button>
              {(() => {
                const tp = meta.totalPages;
                const nums = new Set([1, tp, params.page, params.page - 1, params.page + 1].filter((p) => p >= 1 && p <= tp));
                const sorted = [...nums].sort((a, b) => a - b);
                const out = [];
                sorted.forEach((p, idx) => {
                  if (idx > 0 && p - sorted[idx - 1] > 1) out.push('ellipsis');
                  out.push(p);
                });
                return out.map((p, idx) =>
                  p === 'ellipsis' ? (
                    <span key={`e-${idx}`} style={{ padding: '0 6px', color: 'var(--text-light)' }}>…</span>
                  ) : (
                    <button key={p} type="button" className={params.page === p ? 'active' : ''} onClick={() => goPage(p)}>{p}</button>
                  ),
                );
              })()}
              <button type="button" disabled={params.page >= meta.totalPages} onClick={() => goPage(params.page + 1)}>Sau</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
