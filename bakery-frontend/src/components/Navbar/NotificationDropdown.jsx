import { useState } from 'react';
import { Package, Gift, Info, X, Clock, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function NotificationDropdown({ isOpen, setIsOpen, notifications, markAsRead }) {
  const [selectedNotif, setSelectedNotif] = useState(null);
  const { theme } = useTheme();
  
  if (!isOpen && !selectedNotif) return null;

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
      {isOpen && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 1099 }} 
            onClick={() => setIsOpen(false)} 
          />
          <div className="navbar-notif-dropdown animate-fade-in" style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              width: '400px',
              borderRadius: '20px',
              boxShadow: theme === 'dark' ? '0 30px 100px rgba(0,0,0,0.8)' : '0 20px 70px rgba(0,0,0,0.15)',
              marginTop: '12px',
              zIndex: 1100,
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
              overflow: 'hidden',
          }}>
            <div style={{ 
              padding: '20px 24px', 
              borderBottom: '1px solid var(--border-color)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' 
            }}>
              <strong style={{ fontSize: 17, color: 'var(--text-main)', fontWeight: 800 }}>Thông báo</strong>
              <button type="button" onClick={() => setIsOpen(false)} style={{ background: 'var(--bg-muted)', border: 'none', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', cursor: 'pointer', transition: 'all 0.2s' }}>
                <X size={16} />
              </button>
            </div>
            
            <div className="custom-scrollbar" style={{ maxHeight: 420, overflowY: 'auto' }}>
              {(!notifications || notifications.length === 0) ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-light)' }}>
                   <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                    <Bell size={24} style={{ opacity: 0.3 }} />
                   </div>
                   <div style={{ fontSize: 14, fontWeight: 500 }}>Không có thông báo mới</div>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotifClick(n)}
                    style={{
                      padding: '16px 24px',
                      borderBottom: '1px solid var(--border-color)',
                      background: !n.is_read ? (theme === 'dark' ? 'rgba(196, 92, 106, 0.08)' : 'var(--primary-soft)') : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      gap: '16px',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                        if (n.is_read) e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)';
                    }}
                    onMouseLeave={(e) => {
                        if (n.is_read) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {!n.is_read && (
                      <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                    )}
                    <div style={{ 
                        width: 42, 
                        height: 42, 
                        borderRadius: '14px', 
                        backgroundColor: theme === 'dark' ? '#2e2b28' : '#fff', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        {getIcon(n.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: 14, color: 'var(--text-main)', lineHeight: 1.4, fontWeight: !n.is_read ? 700 : 500 }}>{n.title}</p>
                        <p style={{ 
                            margin: '0 0 8px 0', 
                            fontSize: 12.5, 
                            color: 'var(--text-light)', 
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>{n.message}</p>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={11} /> {new Date(n.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                        </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{ padding: '15px', textAlign: 'center', borderTop: '1px solid var(--border-color)', background: 'var(--bg-light)' }}>
                <a href="/notifications" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'inline-block', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>Xem tất cả thông báo</a>
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {selectedNotif && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
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
