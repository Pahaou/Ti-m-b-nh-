import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { productAPI, reviewAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ButtonLoading, Spinner } from '../components/LoadingSpinner';
import { Star, ArrowLeft, Send, MessageCircle, Pencil, Trash2, ShoppingCart } from 'lucide-react';
import useIsMobile from '../hooks/useIsMobile';
import { useApi } from '../hooks/useApi';

export default function ProductDetailPage() {
  const isMobile = useIsMobile();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useContext(CartContext);
  const { user, isAdmin } = useContext(AuthContext);
  const admin = isAdmin();
  const { showWarning, showSuccess, showError } = useToast();

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingCart, setAddingCart] = useState(false);
  
  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  
  // Edit review state
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  const { data, loading, error, execute: fetchProduct } = useApi(productAPI.getById);
  const { loading: submittingReview, execute: addReview } = useApi(reviewAPI.add);
  const { execute: deleteReview } = useApi(reviewAPI.delete);
  const { loading: updatingReview, execute: updateReview } = useApi(reviewAPI.update);

  const product = data?.data;

  const loadData = useCallback(() => {
    fetchProduct(id).then(res => {
      const p = res?.data;
      if (p?.variants?.length > 0) {
        setSelectedVariant(p.variants[0]);
      }
    });
  }, [id, fetchProduct]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!selectedVariant) return;
    const stock = Number(selectedVariant.stock_quantity || 0);
    if (stock > 0 && quantity > stock) {
      setQuantity(stock);
    }
  }, [selectedVariant, quantity]);

  if (loading && !product) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Spinner size={40} color="#FF6B6B" /></div>;

  if (error) return (
    <div className="container" style={{paddingTop: 150, textAlign: 'center', minHeight: '80vh'}}>
      <div style={{fontSize: 60, marginBottom: 20}}>😕</div>
      <h2 style={{color: 'var(--text-main)', fontWeight: 800}}>Ối, đã có lỗi xảy ra!</h2>
      <p style={{color: 'var(--text-muted)', marginBottom: 30}}>{error}</p>
      <button className="btn-primary" onClick={() => loadData()}>Thử lại</button>
    </div>
  );

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      showWarning("Vui lòng chọn phân loại!");
      return;
    }
    const stock = Number(selectedVariant.stock_quantity || 0);
    if (stock <= 0) {
      showWarning('Phân loại này đang tạm hết hàng.');
      return;
    }
    if (quantity < 1) {
      showWarning('Số lượng phải lớn hơn hoặc bằng 1.');
      return;
    }
    if (quantity > stock) {
      showWarning(`Chỉ còn ${stock} sản phẩm cho phân loại này.`);
      return;
    }
    setAddingCart(true);
    try {
      await addToCart(product.id, selectedVariant.id, quantity);
    } finally {
      setAddingCart(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    
    try {
      await addReview({
        product_id: product.id,
        rating: rating,
        comment: comment
      });
      showSuccess('Cảm ơn bạn đã đánh giá sản phẩm! ⭐');
      setComment('');
      setRating(5);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Không thể gửi đánh giá.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    try {
      await deleteReview(reviewId);
      showSuccess('Đã xóa đánh giá của bạn.');
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Không thể xóa đánh giá.');
    }
  };

  const handleStartEdit = (review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    try {
      await updateReview(editingReviewId, {
        rating: editRating,
        comment: editComment
      });
      showSuccess('Đã cập nhật đánh giá! ✨');
      setEditingReviewId(null);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Không thể cập nhật đánh giá.');
    }
  };

  const finalPrice = product 
    ? (Number(product.base_price) + (selectedVariant ? Number(selectedVariant.price_adjustment) : 0))
    : 0;

  if (!product && !loading) return (
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px'}}>
        <span style={{color: 'var(--text-main)'}}>Không tìm thấy sản phẩm.</span>
    </div>
  );

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '120px', paddingBottom: '60px', minHeight: '80vh' }}>
      <button onClick={() => navigate(-1)} style={{background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 30, cursor: 'pointer', fontWeight: 700}}>
        <ArrowLeft size={16} /> Quay lại
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '50px' }}>
        <div>
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', aspectRatio: '1/1', background: 'var(--bg-muted)', border: '1px solid var(--border-color)' }}>
            <img 
              src={product?.images?.[0]?.image_url || "https://images.unsplash.com/photo-1509440159596-0249088772ff"} 
              alt={product?.name || "Product"} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        <div>
          <span className="badge" style={{position: 'relative', top: 0, left: 0, display: 'inline-block', marginBottom: 15, background: 'var(--primary-soft)', color: 'var(--primary)', fontWeight: 800}}>
            {product?.category_name || 'Bánh Ngon'}
          </span>
          <h1 style={{fontSize: 36, marginBottom: 15, fontWeight: 800, color: 'var(--text-main)'}}>{product?.name || 'Sản phẩm'}</h1>
          
          <div className="card-rating" style={{fontSize: 16, marginBottom: 20, color: 'var(--text-main)', fontWeight: 600}}>
            <Star size={18} fill="#f1c40f" color="#f1c40f" />
            <span>{product?.avg_rating || 0} ({product?.reviews?.length || 0} Đánh giá)</span>
          </div>

          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--primary)', marginBottom: 20 }}>
            {finalPrice.toLocaleString()}đ
          </div>

          <p style={{ color: 'var(--text-light)', lineHeight: 1.8, marginBottom: 30, fontWeight: 500 }}>
            {product?.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
          </p>

          {product?.variants && Array.isArray(product.variants) && product.variants.length > 0 && (
            <div style={{marginBottom: 35}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15}}>
                <div style={{width: 4, height: 20, background: 'var(--primary)', borderRadius: 2}}></div>
                <h4 style={{margin: 0, color: 'var(--text-main)', fontSize: 18, fontWeight: 800}}>Kích cỡ bánh:</h4>
              </div>
              <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>
                {product.variants.map(v => {
                  const isSelected = selectedVariant?.id === v.id;
                  const isOutOfStock = v.stock_quantity === 0;
                  
                  return (
                    <button 
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      style={{
                        padding: '12px 20px',
                        fontSize: 14,
                        fontWeight: 700,
                        borderRadius: 12,
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: isSelected ? 'var(--primary-soft)' : 'var(--bg-light)',
                        color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                        minWidth: 100,
                        opacity: isOutOfStock ? 0.5 : 1,
                        boxShadow: isSelected ? '0 4px 12px rgba(255, 107, 107, 0.2)' : 'none',
                        transform: isSelected ? 'translateY(-2px)' : 'none'
                      }}
                      disabled={isOutOfStock}
                    >
                      <span style={{fontSize: 15}}>{v.size_name}</span>
                      {v.price_adjustment > 0 && (
                        <span style={{fontSize: 12, opacity: 0.8}}>+{Number(v.price_adjustment).toLocaleString()}đ</span>
                      )}
                      {isOutOfStock && <span style={{fontSize: 10, color: 'var(--danger)'}}>Hết hàng</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!admin && (
            <div style={{display: 'flex', gap: 20, alignItems: 'center', marginTop: 40}}>
              <div style={{display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-pill)', overflow: 'hidden', background: 'var(--bg-muted)'}}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{padding: '12px 20px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-main)', fontWeight: 700}}>-</button>
                <span style={{width: 40, textAlign: 'center', fontWeight: '800', color: 'var(--text-main)'}}>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(Number(selectedVariant?.stock_quantity || 1), quantity + 1))} style={{padding: '12px 20px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-main)', fontWeight: 700}}>+</button>
              </div>
              <ButtonLoading 
                isLoading={addingCart} 
                className="btn-primary" 
                style={{flex: 1, padding: '18px', fontSize: '16px', fontWeight: 800}}
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant?.stock_quantity === 0}
              >
                Thêm Vào Giỏ Hàng
              </ButtonLoading>
            </div>
          )}
        </div>
      </div>

      <div style={{marginTop: 80}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, borderBottom: '2px solid var(--border-color)', paddingBottom: 20}}>
           <h2 style={{margin: 0, fontSize: 28, color: 'var(--text-main)', fontWeight: 800}}>Đánh giá của khách hàng ({product?.reviews?.length || 0})</h2>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'start'}}>
          <div style={{display: 'grid', gap: 25}}>
            {product?.reviews && Array.isArray(product.reviews) && product.reviews.length > 0 ? (
              product.reviews.map(r => (
                <div key={r.id} style={{padding: 25, background: 'var(--bg-light)', borderRadius: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)'}}>
                  {editingReviewId === r.id ? (
                      <form onSubmit={handleUpdateReview}>
                          <div style={{display: 'flex', justifyContent: 'center', gap: 5, marginBottom: 15}}>
                              {[1, 2, 3, 4, 5].map((s) => (
                                  <Star 
                                      key={s} size={20} style={{cursor: 'pointer'}}
                                      fill={editRating >= s ? "#f1c40f" : "none"} 
                                      color={editRating >= s ? "#f1c40f" : "var(--text-muted)"}
                                      onClick={() => setEditRating(s)}
                                  />
                              ))}
                          </div>
                          <textarea 
                              className="form-control" rows="3" 
                              value={editComment} onChange={e => setEditComment(e.target.value)}
                              style={{borderRadius: 12, padding: 10, fontSize: 14, marginBottom: 15, border: '1px solid var(--border-color)', background: 'var(--bg-muted)', color: 'var(--text-main)'}}
                          />
                          <div style={{display: 'flex', gap: 10}}>
                              <ButtonLoading isLoading={updatingReview} type="submit" className="btn-primary" style={{flex: 1, padding: '8px', fontSize: 13}}>Lưu</ButtonLoading>
                              <button type="button" onClick={() => setEditingReviewId(null)} className="btn-outline" style={{flex: 1, padding: '8px', fontSize: 13}}>Hủy</button>
                          </div>
                      </form>
                  ) : (
                      <>
                          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 12}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                              <div style={{width: 35, height: 35, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: 14}}>
                              {(r.fullname || 'U').charAt(0).toUpperCase()}
                              </div>
                              <strong style={{color: 'var(--text-main)', fontWeight: 700}}>{r.fullname || 'Người dùng'}</strong>
                          </div>
                          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                              <span style={{color: 'var(--text-muted)', fontSize: 12, fontWeight: 600}}>{new Date(r.created_at).toLocaleDateString('vi-VN')}</span>
                              {user && r.user_id === user.id && (
                                  <div style={{display: 'flex', gap: 8}}>
                                      <button onClick={() => handleStartEdit(r)} style={{background: 'none', border: 'none', color: 'var(--info)', cursor: 'pointer', padding: 4}} title="Sửa">
                                          <Pencil size={14} />
                                      </button>
                                      <button onClick={() => handleDeleteReview(r.id)} style={{background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 4}} title="Xóa">
                                          <Trash2 size={14} />
                                      </button>
                                  </div>
                              )}
                          </div>
                          </div>
                          <div style={{display: 'flex', gap: 2, marginBottom: 12}}>
                          {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} fill={i < r.rating ? "#f1c40f" : "none"} color={i < r.rating ? "#f1c40f" : "var(--bg-muted)"} />
                          ))}
                          </div>
                          <p style={{color: 'var(--text-main)', lineHeight: 1.6, margin: 0, fontWeight: 500}}>{r.comment || 'Không có bình luận.'}</p>
                      </>
                  )}
                </div>
              ))
            ) : (
              <div style={{textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)'}}>
                <MessageCircle size={40} style={{marginBottom: 15, opacity: 0.3}} />
                <p style={{fontWeight: 600}}>Chưa có đánh giá nào. Hãy là người đầu tiên thưởng thức và đánh giá nhé!</p>
              </div>
            )}
          </div>

          <div style={{background: 'var(--bg-light)', padding: 30, borderRadius: '25px', boxShadow: 'var(--shadow-md)', position: 'sticky', top: 120, border: '1px solid var(--border-color)'}}>
            <h3 style={{marginBottom: 20, textAlign: 'center', color: 'var(--text-main)', fontWeight: 800}}>Viết đánh giá của bạn</h3>
            
            {user ? (
              <form onSubmit={handleSubmitReview}>
                <div style={{textAlign: 'center', marginBottom: 25}}>
                  <label style={{display: 'block', marginBottom: 10, color: 'var(--text-light)', fontSize: 14, fontWeight: 600}}>Bạn chấm sản phẩm này mấy sao?</label>
                  <div style={{display: 'flex', justifyContent: 'center', gap: 8}}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={32} 
                        style={{cursor: 'pointer', transition: 'transform 0.2s', transform: (hoverRating || rating) >= star ? 'scale(1.1)' : 'scale(1)'}}
                        fill={(hoverRating || rating) >= star ? "#f1c40f" : "none"} 
                        color={(hoverRating || rating) >= star ? "#f1c40f" : "var(--text-muted)"}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{marginBottom: 20}}>
                  <label style={{display: 'block', marginBottom: 8, color: 'var(--text-light)', fontSize: 14, fontWeight: 600}}>Cảm nhận của bạn (không bắt buộc)</label>
                  <textarea 
                    className="form-control" 
                    rows="4" 
                    placeholder="Bánh ngon tuyệt, bao bì đẹp..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    style={{borderRadius: 15, padding: 15, border: '1px solid var(--border-color)', background: 'var(--bg-muted)', color: 'var(--text-main)', resize: 'none'}}
                  ></textarea>
                </div>

                <ButtonLoading 
                  isLoading={submittingReview} 
                  type="submit" 
                  className="btn-primary" 
                  style={{width: '100%', padding: '18px', borderRadius: 15, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, fontWeight: 800}}
                >
                  <Send size={18} /> Gửi đánh giá
                </ButtonLoading>
              </form>
            ) : (
              <div style={{textAlign: 'center', padding: '20px 0'}}>
                <p style={{color: 'var(--text-muted)', marginBottom: 20, fontWeight: 600}}>Vui lòng đăng nhập để có thể đánh giá sản phẩm này.</p>
                <button className="btn-primary" onClick={() => navigate('/login')} style={{padding: '12px 30px', fontWeight: 800}}>Đăng nhập ngay</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {product?.related && Array.isArray(product.related) && product.related.length > 0 && (
        <div style={{marginTop: 80}}>
          <h2 className="section-title" style={{textAlign: 'left', borderBottom: '2px solid var(--border-color)', paddingBottom: 20, marginBottom: 40, color: 'var(--text-main)', fontWeight: 800}}>Có thể bạn cũng thích</h2>
          <div className="product-grid">
            {product.related.map(item => <ProductCard key={item.id} item={item} />)}
          </div>
        </div>
      )}

      {isMobile && product && !admin && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          background: 'var(--bg-light)',
          padding: '12px 20px calc(12px + env(safe-area-inset-bottom))',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '15px',
          zIndex: 2001
        }}>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <span style={{fontSize: 12, color: 'var(--text-muted)', fontWeight: 600}}>Giá dự kiến:</span>
            <span style={{fontSize: 18, fontWeight: 900, color: 'var(--primary)'}}>{finalPrice.toLocaleString()}đ</span>
          </div>
          <ButtonLoading 
            isLoading={addingCart} 
            className="btn-primary" 
            style={{flex: 1, padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 800}}
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant?.stock_quantity === 0}
          >
            <ShoppingCart size={18} /> Thêm Vào Giỏ
          </ButtonLoading>
        </div>
      )}
    </div>
  );
}
