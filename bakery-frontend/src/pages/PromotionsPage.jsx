import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle, Clock, Copy, Gift, Star, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { marketingAPI, rewardAPI } from '../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.36 } },
};

const formatMoney = (value) => `${Number(value || 0).toLocaleString()}đ`;

const formatDate = (value) => {
  if (!value) return 'Không giới hạn';
  return new Date(value).toLocaleDateString('vi-VN');
};

const describeUsage = (coupon) => {
  if (!coupon.usage_limit) return 'Không giới hạn';
  const remaining = Math.max(0, Number(coupon.usage_limit) - Number(coupon.used_count || 0));
  return remaining.toLocaleString();
};

function describeDiscount(coupon) {
  if (coupon.discount_type === 'percent') {
    const cap = coupon.max_discount_amount ? ` tối đa ${formatMoney(coupon.max_discount_amount)}` : '';
    return `Giảm ${Number(coupon.discount_value)}%${cap}`;
  }
  return `Giảm ${formatMoney(coupon.discount_value)}`;
}

export default function PromotionsPage() {
  const { user, isAdmin } = useAuth();
  const reduceMotion = useReducedMotion();
  const [coupons, setCoupons] = useState([]);
  const [myVouchers, setMyVouchers] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [currentPoints, setCurrentPoints] = useState(user?.loyalty_points || 0);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [promoRes, rewardRes, profileRes] = await Promise.allSettled([
          marketingAPI.getPromotions(),
          rewardAPI.getAll(),
          user ? rewardAPI.getMembershipProfile() : Promise.resolve(null),
        ]);

        if (promoRes.status === 'fulfilled') {
          setCoupons(promoRes.value.data.data || []);
        }

        if (rewardRes.status === 'fulfilled') {
          setRewards(rewardRes.value.data.data || []);
        }

        if (profileRes.status === 'fulfilled' && profileRes.value?.data?.data) {
          const profile = profileRes.value.data.data;
          setCurrentPoints(profile.points || 0);
          setMyVouchers(profile.vouchers || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const handleRedeem = async (rewardId) => {
    if (!user) {
      alert('Vui lòng đăng nhập để đổi quà.');
      return;
    }

    setRedeemingId(rewardId);
    try {
      const res = await rewardAPI.redeem(rewardId);
      const couponCode = res.data?.data?.couponCode;
      alert(couponCode ? `Đổi quà thành công. Mã voucher: ${couponCode}` : 'Đổi quà thành công.');

      const profileRes = await rewardAPI.getMembershipProfile();
      setCurrentPoints(profileRes.data.data.points || 0);
      setMyVouchers(profileRes.data.data.vouchers || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi đổi quà.');
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div className="page-container" style={{ backgroundColor: '#fcf8f9' }}>
      <div className="container" style={{ padding: '40px 16px 80px', maxWidth: 1040, margin: '0 auto' }}>
        <header style={{ marginBottom: 44, textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(28px, 8vw, 40px)', fontWeight: 800, marginBottom: 12 }}>
            Khuyến mãi & ưu đãi
          </h1>
          <p style={{ color: 'var(--text-light)', fontSize: 16 }}>
            Danh sách mã đang hoạt động, điều kiện áp dụng và quà đổi điểm.
          </p>
        </header>

        <section style={{ marginBottom: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Ticket size={24} />
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Mã giảm giá đang áp dụng</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 20 }} />)
            ) : coupons.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: 32, borderRadius: 20, background: 'white', color: 'var(--text-light)', textAlign: 'center' }}>
                Hiện chưa có mã khuyến mãi công khai đang hoạt động.
              </div>
            ) : (
              coupons.map((coupon) => {
                return (
                  <motion.div
                    key={coupon.id}
                    initial={reduceMotion ? false : 'hidden'}
                    whileInView={reduceMotion ? undefined : 'show'}
                    viewport={{ once: true }}
                    variants={fadeUp}
                    style={{
                      background: 'white',
                      borderRadius: 20,
                      padding: 22,
                      border: '1px solid var(--border-color)',
                      boxShadow: '0 4px 18px rgba(0,0,0,0.035)',
                    }}
                  >
                    <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 13, marginBottom: 6, letterSpacing: '0.04em' }}>
                      {describeDiscount(coupon)}
                    </div>
                    <h3 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 900, color: 'var(--text-main)' }}>
                      {coupon.code}
                    </h3>
                    <div style={{ display: 'grid', gap: 6, color: 'var(--text-light)', fontSize: 13, marginBottom: 18 }}>
                      <span>Đơn tối thiểu: <strong>{formatMoney(coupon.min_order_value)}</strong></span>
                      <span>Lượt còn lại: <strong>{describeUsage(coupon)}</strong></span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={13} /> Hết hạn: {formatDate(coupon.valid_until)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(coupon.code)}
                      className="btn btn--primary"
                      style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      {copiedCode === coupon.code ? <CheckCircle size={16} /> : <Copy size={16} />}
                      {copiedCode === coupon.code ? 'Đã sao chép' : 'Sao chép mã'}
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>
        </section>

        {user && !isAdmin() && (
          <section style={{ marginBottom: 60 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#eef8f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
                <Gift size={24} />
              </div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Voucher của tôi</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {loading ? (
                [...Array(2)].map((_, i) => <div key={i} className="skeleton" style={{ height: 170, borderRadius: 20 }} />)
              ) : myVouchers.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: 28, borderRadius: 20, background: 'white', color: 'var(--text-light)', textAlign: 'center' }}>
                  Bạn chưa có voucher cá nhân nào. Hãy đổi điểm để nhận mã riêng.
                </div>
              ) : (
                myVouchers.map((voucher) => (
                  <motion.div
                    key={voucher.id}
                    initial={reduceMotion ? false : 'hidden'}
                    whileInView={reduceMotion ? undefined : 'show'}
                    viewport={{ once: true }}
                    variants={fadeUp}
                    style={{
                      background: 'white',
                      borderRadius: 20,
                      padding: 22,
                      border: '1px solid var(--border-color)',
                      boxShadow: '0 4px 18px rgba(0,0,0,0.035)',
                    }}
                  >
                    <div style={{ color: '#15803d', fontWeight: 800, fontSize: 13, marginBottom: 6, letterSpacing: '0.04em' }}>
                      {describeDiscount(voucher)}
                    </div>
                    <h3 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 900, color: 'var(--text-main)' }}>
                      {voucher.code}
                    </h3>
                    <div style={{ display: 'grid', gap: 6, color: 'var(--text-light)', fontSize: 13, marginBottom: 18 }}>
                      <span>Đơn tối thiểu: <strong>{formatMoney(voucher.min_order_value)}</strong></span>
                      <span>Lượt còn lại: <strong>{describeUsage(voucher)}</strong></span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={13} /> Hết hạn: {formatDate(voucher.valid_until)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(voucher.code)}
                      className="btn btn--primary"
                      style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      {copiedCode === voucher.code ? <CheckCircle size={16} /> : <Copy size={16} />}
                      {copiedCode === voucher.code ? 'Đã sao chép' : 'Sao chép mã'}
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        )}

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <Star size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Đổi điểm thưởng</h2>
              <div style={{ fontSize: 14, color: 'var(--text-light)' }}>
                Bạn đang có: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{currentPoints.toLocaleString()} điểm</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {loading ? (
              [...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 220, borderRadius: 20 }} />)
            ) : rewards.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: 32, borderRadius: 20, background: 'white', color: 'var(--text-light)', textAlign: 'center' }}>
                Hiện chưa có quà đổi điểm.
              </div>
            ) : (
              rewards.map((reward) => (
                <motion.div
                  key={reward.id}
                  initial={reduceMotion ? false : 'hidden'}
                  whileInView={reduceMotion ? undefined : 'show'}
                  viewport={{ once: true }}
                  variants={fadeUp}
                  style={{
                    background: 'white',
                    borderRadius: 20,
                    padding: 22,
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 16,
                    boxShadow: '0 4px 18px rgba(0,0,0,0.035)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Gift size={24} />
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary)' }}>{reward.points_required}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-light)', fontWeight: 700, letterSpacing: '0.1em' }}>ĐIỂM</div>
                      </div>
                    </div>
                    <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>{reward.name}</h3>
                    <p style={{ margin: 0, color: 'var(--text-light)', fontSize: 13, lineHeight: 1.5 }}>{reward.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRedeem(reward.id)}
                    disabled={redeemingId === reward.id || currentPoints < reward.points_required}
                    className="btn btn--primary"
                    style={{ width: '100%', opacity: currentPoints < reward.points_required ? 0.55 : 1 }}
                  >
                    {redeemingId === reward.id ? 'Đang xử lý...' : currentPoints < reward.points_required ? 'Chưa đủ điểm' : 'Đổi ngay'}
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
