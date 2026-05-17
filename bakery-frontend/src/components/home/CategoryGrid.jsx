const CATEGORY_ICON_MAP = {
  'Bánh Mousse': '/images/categories/mousse.svg',
  'Bánh Kem': '/images/categories/cake.svg',
  'CupCake': '/images/categories/cupcake.svg',
  'Bánh Mì và Bánh Mặn': '/images/categories/bread.svg',
  'Bánh Ngọt': '/images/categories/sweets.svg',
  'COMBO Tiết Kiệm': '/images/categories/combo.svg',
  'Hàng bị lỗi': '/images/categories/sweets.svg',
};

export default function CategoryGrid({ categories, onPick }) {
  return (
    <section className="section-categories">
      <div className="container">
        <div className="section-header-row">
          <h2 className="section-title-alt">Danh mục</h2>
          <button className="link-see-more" onClick={() => onPick('all')}>
            Xem thêm <span className="arrow">›</span>
          </button>
        </div>
        
        <div className="category-modern-grid">
          {(categories || []).map((c) => (
            <div
              key={c.id}
              className={`category-modern-card${c.is_defect ? ' category-modern-card--defect' : ''}`}
              onClick={() => onPick(String(c.id))}
            >
              <div className="category-modern-card__box">
                <img 
                  src={CATEGORY_ICON_MAP[c.name] || '/images/categories/mousse.svg'} 
                  alt={c.name} 
                  className="category-modern-card__img" 
                />
              </div>
              <span className="category-modern-card__name">
                {c.name}
                {c.is_defect && <small style={{ display: 'block', color: '#e65100', fontSize: 11 }}>Thanh lý</small>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
