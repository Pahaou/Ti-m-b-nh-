import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Gift, Star, Clock, ChevronDown, Copy, Check, Ticket, Award, Zap, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { rewardAPI } from '../services/api';

const TIER_CONFIG = [
  { name: 'Bronze', min: 0, max: 1000, color: '#CD7F32', benefits: 'Tích điểm đổi quà' },
  { name: 'Silver', min: 1000, max: 3000, color: '#C0C0C0', benefits: 'Giảm 2% mỗi đơn hàng' },
  { name: 'Gold', min: 3000, max: 5000, color: '#FFD700', benefits: 'Giảm 5% mỗi đơn hàng + Quà sinh nhật' },
  { name: 'Platinum', min: 5000, max: 10000, color: '#E5E4E2', benefits: 'Giảm 10% đơn hàng + Giao hàng ưu tiên' },
];

export default function MembershipPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (user && isAdmin()) {
    navigate('/admin', { replace: true });
    return null;
  }

  if (!user) {
    navigate('/login');
    return null;
  }
  
  if (user.role === 'admin') {
    navigate('/admin');
    return null;
  }

  const [loyaltyInfo, setLoyaltyInfo] = useState({
    points: user?.loyalty_points || 0,
    tier: user?.membership_tier ? (user.membership_tier.charAt(0).toUpperCase() + user.membership_tier.slice(1)) : 'Bronze',
    nextTierPoints: 1000,
    history: [],
    vouchers: []
  });
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const INITIAL_COUNT = 5;

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      setLoading(true);
      try {
        const response = await rewardAPI.getMembershipProfile();
        const data = response.data.data;

        const currentTier = TIER_CONFIG.find(t => t.name.toLowerCase() === data.tier.toLowerCase()) || TIER_CONFIG[0];
        
        setLoyaltyInfo({
          points: data.points || 0,
          tier: currentTier.name,
          nextTierPoints: currentTier.max,
          vouchers: data.vouchers || [],
          history: (data.history || []).map(h => ({
            id: h.id,
            type: h.type,
            points: h.points,
            date: new Date(h.date).toLocaleDateString('vi-VN'),
            reason: h.reason
          }))
        });
      } catch (err) {
        console.error('Lỗi lấy dữ liệu hội viên:', err);
        // If it fails, we keep the initial state but stop loading
      } finally {
        setLoading(false);
      }
    };

    fetchLoyaltyData();
  }, []);

  const progress = Math.min((loyaltyInfo.points / loyaltyInfo.nextTierPoints) * 100, 100);
  const currentTierData = TIER_CONFIG.find(t => t.name === loyaltyInfo.tier) || TIER_CONFIG[0];

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="page-container" style={{ backgroundColor: '#fcf8f9' }}>
        <div className="container" style={{ padding: '24px 16px', maxWidth: 800, margin: '0 auto' }}>
          <div className="skeleton" style={{ height: 40, width: '60%', marginBottom: 28, borderRadius: 8 }}></div>
          <div className="skeleton" style={{ height: 200, width: '100%', marginBottom: 24, borderRadius: 24 }}></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            <div className="skeleton" style={{ height: 100, borderRadius: 20 }}></div>
            <div className="skeleton" style={{ height: 100, borderRadius: 20 }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ backgroundColor: '#fcf8f9' }}>
      <div className="container" style={{ padding: '24px 16px 80px', maxWidth: 800, margin: '0 auto' }}>
        
        {/* === HEADER SECTION === */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(24px, 6vw, 32px)', fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Thành viên của HXH</h1>
          <p style={{ color: 'var(--text-light)', fontSize: 14 }}>Tích lũy điểm để nhận ưu đãi và đặc quyền cao cấp.</p>
        </div>

        {/* === MAIN CARD: POINTS & TIER === */}
        <div style={{ 
          background: 'linear-gradient(135deg, #2d3436 0%, #000000 100%)', 
          borderRadius: 24, 
          padding: 'clamp(24px, 5vw, 32px)', 
          color: 'white', 
          marginBottom: 24,
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: 60, background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', bottom: -10, left: 20, width: 60, height: 60, borderRadius: 30, background: 'rgba(255,255,255,0.03)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <ShieldCheck size={18} style={{ color: currentTierData.color }} />
                <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
                  Hạng {loyaltyInfo.tier}
                </span>
              </div>
              <div style={{ fontSize: 'clamp(32px, 8vw, 44px)', fontWeight: 800, display: 'flex', alignItems: 'baseline', gap: 10 }}>
                {loyaltyInfo.points.toLocaleString()}
                <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>điểm tích lũy</span>
              </div>
            </div>
            <Award size={48} style={{ color: currentTierData.color, opacity: 0.9 }} />
          </div>

          {/* Progress Section */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, position: 'relative', marginBottom: 12 }}>
              <div style={{ 
                height: '100%', 
                width: `${progress}%`, 
                backgroundColor: currentTierData.color, 
                borderRadius: 4, 
                boxShadow: `0 0 15px ${currentTierData.color}`,
                transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)' 
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              <span>Tiến trình lên hạng</span>
              <span style={{ color: 'white', fontWeight: 600 }}>{loyaltyInfo.points} / {loyaltyInfo.nextTierPoints}</span>
            </div>
          </div>
        </div>

        {/* === QUICK ACTIONS GRID === */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          <Link to="/promotions" style={{ textDecoration: 'none' }}>
            <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 20, border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.3s ease' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                <Gift size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>Đổi điểm</div>
                <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>Nhận voucher giảm giá</div>
              </div>
            </div>
          </Link>
          <Link to="/products" style={{ textDecoration: 'none' }}>
            <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 20, border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.3s ease' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                <Zap size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>Mua bánh</div>
                <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>Tích thêm điểm ngay</div>
              </div>
            </div>
          </Link>
        </div>

        {/* === TIER BENEFITS SECTION === */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Award size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: 18, margin: 0, fontWeight: 700 }}>Đặc quyền thứ hạng</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {TIER_CONFIG.map((t, i) => (
              <div key={i} style={{ 
                backgroundColor: loyaltyInfo.tier === t.name ? 'white' : 'transparent',
                padding: '16px 20px', 
                borderRadius: 16, 
                border: loyaltyInfo.tier === t.name ? '2px solid var(--primary)' : '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                opacity: loyaltyInfo.tier === t.name ? 1 : 0.6
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.color, flexShrink: 0 }}>
                  <Star size={20} fill={t.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Hạng {t.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-light)' }}>{t.benefits}</div>
                </div>
                {loyaltyInfo.tier === t.name && (
                  <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>Đang ở hạng này</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* === MY VOUCHERS SECTION === */}
        {loyaltyInfo.vouchers.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Ticket size={20} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: 18, margin: 0, fontWeight: 700 }}>Voucher của tôi</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {loyaltyInfo.vouchers.map((v) => (
                <div key={v.id} style={{
                  backgroundColor: 'white',
                  border: '1.5px dashed var(--border)',
                  borderRadius: 16,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>Voucher giảm {v.discount_type === 'percent' ? `${v.discount_value}%` : `${v.discount_value.toLocaleString()}đ`}</div>
                    <code style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>{v.code}</code>
                  </div>
                  <button
                    onClick={() => handleCopy(v.code)}
                    style={{
                      width: 40, height: 40, borderRadius: 12,
                      border: copiedCode === v.code ? '1px solid #22c55e' : '1px solid var(--primary)',
                      backgroundColor: copiedCode === v.code ? '#f0fdf4' : 'transparent',
                      color: copiedCode === v.code ? '#22c55e' : 'var(--primary)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {copiedCode === v.code ? <Check size={18} /> : <Copy size={16} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === HISTORY SECTION === */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Clock size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: 18, margin: 0, fontWeight: 700 }}>Lịch sử điểm</h2>
          </div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: 20, border: '1px solid #eee', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          {loyaltyInfo.history.length > 0 ? (
            <>
              {(showAll ? loyaltyInfo.history : loyaltyInfo.history.slice(0, INITIAL_COUNT)).map((item, index, arr) => (
                <div key={item.id} style={{
                  padding: '16px 20px',
                  borderBottom: index < arr.length - 1 ? '1px solid #f5f5f5' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      backgroundColor: item.type === 'earn' ? '#f0fdf4' : '#fef2f2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: item.type === 'earn' ? '#16a34a' : '#dc2626'
                    }}>
                      {item.type === 'earn' ? <Star size={18} /> : <Gift size={18} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.reason}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>{item.date}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: item.type === 'earn' ? '#16a34a' : '#dc2626' }}>
                    {item.type === 'earn' ? '+' : ''}{item.points}
                  </div>
                </div>
              ))}
              {loyaltyInfo.history.length > INITIAL_COUNT && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  style={{
                    width: '100%', padding: '14px', border: 'none', borderTop: '1px solid #eee',
                    backgroundColor: 'transparent', color: 'var(--primary)', fontWeight: 700,
                    fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  <ChevronDown size={16} style={{ transform: showAll ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                  {showAll ? 'Thu gọn' : `Xem thêm ${loyaltyInfo.history.length - INITIAL_COUNT} giao dịch`}
                </button>
              )}
            </>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)', fontSize: 14 }}>Chưa có giao dịch nào</div>
          )}
        </div>

      </div>
    </div>
  );
}
