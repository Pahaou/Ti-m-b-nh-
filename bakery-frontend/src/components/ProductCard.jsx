import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';

function StarRow({ value, count }) {
  const v = Math.min(5, Math.max(0, Number(value) || 0));
  const display = v > 0 ? v.toFixed(1) : '—';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-light)' }}>
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={12} style={{ color: i < Math.round(v) ? '#d4a574' : 'var(--border-color)', fill: i < Math.round(v) ? '#d4a574' : 'none' }} />
      ))}
      <span style={{ fontWeight: 600, color: 'var(--text-main)', marginLeft: 2 }}>{display}</span>
      {count > 0 && <span>({count})</span>}
    </div>
  );
}

export default function ProductCard({ item, listVariants, compact = false }) {
  const [imgError, setImgError] = useState(false);
  const [hover, setHover] = useState(false);
  const reduceMotion = useReducedMotion();
  const { isAdmin } = useContext(AuthContext);
  const admin = isAdmin();
  const rating = Number(item.avg_rating) || 0;
  const reviewCount = Number(item.review_count) || 0;
  const gridChild = Boolean(listVariants) && !reduceMotion;

  /* ── Determine badges ── */
  const badges = [];
  if (item.is_best_seller === 1) badges.push({ label: 'Bán chạy', type: 'hot' });
  if (item.category_is_defect) badges.push({ label: 'Thanh lý', type: 'sale' });
  if (item.is_new) badges.push({ label: 'Mới', type: 'new' });
  if (item.discount_percent) badges.push({ label: `-${item.discount_percent}%`, type: 'sale' });

  const badgeColors = {
    hot: { bg: 'var(--primary-gradient)', color: '#fff' },
    new: { bg: 'linear-gradient(135deg, #2d8a5c, #3bba75)', color: '#fff' },
    sale: { bg: 'linear-gradient(135deg, #e53e3e, #f56565)', color: '#fff' },
  };

  /* ── compact card (for homepage featured / category sections) ── */
  if (compact) {
    return (
      <motion.article
        variants={gridChild ? listVariants : undefined}
        initial={gridChild ? undefined : reduceMotion ? false : { opacity: 0, y: 14 }}
        whileInView={gridChild || reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={gridChild || reduceMotion ? undefined : { once: true, margin: '-48px' }}
        transition={gridChild ? undefined : { duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        whileTap={reduceMotion ? undefined : { scale: 0.985 }}
        style={{ width: '100%' }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Link to={`/product/${item.id}`} className="compact-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div className="compact-card__img-wrap">
            {badges.length > 0 && (
              <span
                className="compact-card__badge"
                style={{ background: badgeColors[badges[0].type]?.bg }}
              >
                {badges[0].label}
              </span>
            )}
            <img
              src={imgError ? 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=75&fm=webp' : ((item.thumbnail || item.image_url)?.includes('unsplash.com') ? `${item.thumbnail || item.image_url}&w=600&q=75&fm=webp` : (item.thumbnail || item.image_url))}
              alt=""
              onError={() => setImgError(true)}
              className="compact-card__img"
              style={{
                transform: hover ? 'scale(1.06)' : 'scale(1)',
              }}
            />
            {/* Quick add overlay */}
            <div className="compact-card__overlay" style={{ opacity: hover ? 1 : 0 }}>
              <span className="compact-card__quick-add">
                Xem chi tiết
              </span>
            </div>
          </div>
          <div className="compact-card__info">
            <h3 className="compact-card__name">{item.name}</h3>
            {rating > 0 && <StarRow value={rating} count={reviewCount} />}
            <p className="compact-card__price">
              <span className="compact-card__price-value">{Number(item.base_price).toLocaleString('vi-VN')}đ</span>
            </p>
          </div>
        </Link>
      </motion.article>
    );
  }

  /* ── full card (for all-products grid) ── */
  return (
    <motion.article
      variants={gridChild ? listVariants : undefined}
      initial={gridChild ? undefined : reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={gridChild || reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={gridChild || reduceMotion ? undefined : { once: true, margin: '-48px' }}
      transition={gridChild ? undefined : { duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      style={{ width: '100%' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link to={`/product/${item.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div
          className="glass-card product-card-full"
          style={{
            overflow: 'hidden',
            borderRadius: 'var(--radius-lg)',
            transition: 'box-shadow 0.25s ease, transform 0.25s ease',
            boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
            transform: hover ? 'translateY(-4px)' : 'none',
          }}
        >
          <div
            style={{
              aspectRatio: '4 / 5',
              position: 'relative',
              background: 'var(--bg-muted)',
              overflow: 'hidden',
            }}
          >
            {/* Badges stack */}
            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 3, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {badges.map((badge, i) => (
                <span
                  key={i}
                  className="promo-badge"
                  style={{
                    background: badgeColors[badge.type]?.bg,
                    position: 'relative',
                    top: 'auto',
                    left: 'auto',
                    fontSize: 10,
                    padding: '5px 12px',
                  }}
                >
                  {badge.label}
                </span>
              ))}
            </div>

            <img
              src={imgError ? 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=75&fm=webp' : ((item.thumbnail || item.image_url)?.includes('unsplash.com') ? `${item.thumbnail || item.image_url}&w=800&q=75&fm=webp` : (item.thumbnail || item.image_url))}
              alt=""
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: hover ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.45s ease',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: hover ? 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' : 'linear-gradient(to top, rgba(0,0,0,0.12) 0%, transparent 40%)',
                pointerEvents: 'none',
                transition: 'background 0.3s ease',
              }}
            />
            {/* Hover CTA */}
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 16,
                display: 'flex',
                justifyContent: 'center',
                opacity: hover ? 1 : 0,
                transform: hover ? 'translateY(0)' : 'translateY(8px)',
                transition: 'all 0.3s ease',
                pointerEvents: hover ? 'auto' : 'none',
              }}
            >
              <span
                className="btn btn--sm"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  color: 'var(--primary)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                }}
              >
                {admin ? 'Xem chi tiết' : <><ShoppingCart size={15} /> Xem & Đặt hàng</>}
              </span>
            </div>
          </div>
          <div style={{ padding: '16px 18px 20px' }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
              {item.category_name}
            </p>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {item.name}
            </h3>
            <StarRow value={rating} count={reviewCount} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>
                {Number(item.base_price).toLocaleString('vi-VN')}đ
              </span>
            </div>
            {item.description && (
              <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 8, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.description}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
