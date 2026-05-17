import { useState } from 'react';
import { Package, Gift, Info, X, Clock } from 'lucide-react';

function NotificationDropdown({ notifications, notifOpen, setNotifOpen, markAsRead }) {
  const [selectedNotif, setSelectedNotif] = useState(null);
  const hasUnread = notifications.some((n) => !n.is_read);

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <Package size={18} style={{ color: 'var(--primary)' }} />;
      case 'promo': return <Gift size={18} style={{ color: '#F59E0B' }} />;
      default: return <Info size={18} style={{ color: '#3B82F6' }} />;
    }
  };

  const handleNotifClick = (n) => {
    setSelectedNotif(n);
    if (!n.is_read) {
      markAsRead(n.id);
    }
  };

  return (
    <>
      {notifOpen && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 1099 }} 
            onClick={() => setNotifOpen(false)} 
          />
          <div className="navbar-notif-dropdown animate-fade-in" style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              width: '350px',
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              marginTop: '15px',
              zIndex: 1100,
              border: '1px solid var(--border-color)',
              overflow: 'hidden'
          }}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-muted)' }}>
              <strong style={{ fontSize: 14, color: 'var(--text-main)' }}>Thông báo</strong>
              <button type="button" onClick={() => setNotifOpen(false)} style={{ background: 'none', border: 'none', fontSize: 18, color: 'var(--text-light)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={18} />
              </button>
            </div>
            
            <div style={{ maxHeight: 400, overflowY: 'auto' }} className="custom-scrollbar">
              {(!notifications || notifications.length === 0) ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-light)' }}>
                   <Info size={32} style={{ opacity: 0.2, marginBottom: 10 }} />
                   <div style={{ fontSize: 13 }}>Không có thông báo mới</div>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotifClick(n)}
                    style={{
                      padding: '15px 20px',
                      borderBottom: '1px solid var(--border-color)',
                      background: !n.is_read ? 'var(--primary-soft)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      display: 'flex',
                      gap: '12px'
                    }}
                    className="notif-item-hover"
                  >
                    <div style={{ 
                        width: 36, 
                        height: 36, 
                        borderRadius: '10px', 
                        backgroundColor: 'var(--surface)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid var(--border-color)'
                    }}>
                        {getIcon(n.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: 13, color: 'var(--text-main)', lineHeight: 1.4, fontWeight: !n.is_read ? 700 : 500 }}>{n.title}</p>
                        <p style={{ 
                            margin: '0 0 6px 0', 
                            fontSize: 12, 
                            color: 'var(--text-light)', 
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>{n.message}</p>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={10} /> {new Date(n.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                        </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
                <a href="/notifications" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Xem tất cả thông báo</a>
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {selectedNotif && (
        <div style={{ position: 'fixed', inset: 0, zInitialize: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 2000 }}>
             <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedNotif(null)} />
             <div style={{ 
                 position: 'relative', 
                 width: '100%', 
                 maxWidth: 450, 
                 backgroundColor: 'var(--surface)', 
                 borderRadius: 24, 
                 padding: 30,
                 boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                 animation: 'modalFadeUp 0.3s ease-out'
             }}>
                 <button onClick={() => setSelectedNotif(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'var(--bg-muted)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={18} />
                 </button>
                 
                 <div style={{ textAlign: 'center', marginBottom: 25 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: 'var(--primary)' }}>
                        {getIcon(selectedNotif.type)}
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 10px 0' }}>{selectedNotif.title}</h2>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(selectedNotif.created_at).toLocaleString('vi-VN')}
                    </div>
                 </div>

                 <div style={{ 
                     backgroundColor: 'var(--bg-muted)', 
                     padding: 20, 
                     borderRadius: 16, 
                     fontSize: 15, 
                     lineHeight: 1.6, 
                     color: 'var(--text-main)',
                     marginBottom: 25
                 }}>
                    {selectedNotif.message}
                 </div>

                 <button 
                    className="btn-primary" 
                    style={{ width: '100%', padding: '14px', borderRadius: '12px' }}
                    onClick={() => setSelectedNotif(null)}
                 >
                    Đã hiểu
                 </button>
             </div>
        </div>
      )}
    </>
  );
}

export default NotificationDropdown;
