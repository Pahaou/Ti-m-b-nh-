import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Bell, CheckCircle, Package, Gift, Info } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [selectedNotif, setSelectedNotif] = useState(null);
  const { execute: fetchNotifs, data, loading } = useApi(notificationAPI.getAll);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchNotifs();
  }, [user, navigate, fetchNotifs]);

  const notifications = data?.data || [];

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <Package size={20} style={{ color: 'var(--primary)' }} />;
      case 'promo': return <Gift size={20} style={{ color: '#F59E0B' }} />;
      default: return <Info size={20} style={{ color: '#3B82F6' }} />;
    }
  };

  return (
    <div className="page-container">
      <div className="container" style={{ padding: '40px 16px 80px', maxWidth: 800 }}>
        <motion.div
          style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}
          initial={reduceMotion ? false : { opacity: 0, x: -20 }}
          animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Bell size={24} />
          </div>
          <h1 className="section-title-new" style={{ margin: 0, textAlign: 'left', fontSize: 28 }}>Thông báo của bạn</h1>
        </motion.div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>Đang tải thông báo...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 64, backgroundColor: 'var(--surface)', borderRadius: 24, border: '1px solid var(--border)' }}>
            <Bell size={48} style={{ color: 'var(--text-light)', marginBottom: 16, opacity: 0.5 }} />
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Chưa có thông báo nào</div>
            <p style={{ color: 'var(--text-light)' }}>Khi có khuyến mãi hoặc cập nhật đơn hàng, thông báo sẽ hiển thị ở đây.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {notifications.map((notif, i) => (
              <motion.div
                key={notif.id}
                variants={reduceMotion ? undefined : fadeUp}
                initial="hidden"
                animate="show"
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                   setSelectedNotif(notif);
                   if (!notif.is_read) markAsRead(notif.id);
                }}
                style={{
                  display: 'flex',
                  gap: 16,
                  padding: 24,
                  backgroundColor: notif.is_read ? 'var(--surface)' : 'var(--bg)',
                  borderRadius: 16,
                  border: `1px solid ${notif.is_read ? 'var(--border)' : 'var(--primary-light)'}`,
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                {!notif.is_read && (
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: 'var(--primary)' }} />
                )}
                
                <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border)' }}>
                  {getIcon(notif.type)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: notif.is_read ? 600 : 700 }}>{notif.title}</h3>
                    <span style={{ fontSize: 12, color: 'var(--text-light)', whiteSpace: 'nowrap', marginLeft: 16 }}>
                      {new Date(notif.created_at).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ 
                      margin: 0, 
                      color: notif.is_read ? 'var(--text-light)' : 'var(--text)', 
                      fontSize: 14, 
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                  }}>
                    {notif.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedNotif && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
             <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedNotif(null)} />
             <div style={{ 
                 position: 'relative', 
                 width: '100%', 
                 maxWidth: 500, 
                 backgroundColor: 'var(--surface)', 
                 borderRadius: 24, 
                 padding: 40,
                 boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                 animation: 'modalFadeUp 0.3s ease-out'
             }}>
                 <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <div style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--primary)' }}>
                        {getIcon(selectedNotif.type)}
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 10px 0' }}>{selectedNotif.title}</h2>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                        {new Date(selectedNotif.created_at).toLocaleString('vi-VN', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                 </div>

                 <div style={{ 
                     backgroundColor: 'var(--bg-muted)', 
                     padding: 25, 
                     borderRadius: 20, 
                     fontSize: 16, 
                     lineHeight: 1.7, 
                     color: 'var(--text-main)',
                     marginBottom: 30,
                     textAlign: 'center'
                 }}>
                    {selectedNotif.message}
                 </div>

                 <button 
                    className="btn-primary" 
                    style={{ width: '100%', padding: '16px', borderRadius: '14px', fontSize: 16, fontWeight: 700 }}
                    onClick={() => setSelectedNotif(null)}
                 >
                    Đã hiểu
                 </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
