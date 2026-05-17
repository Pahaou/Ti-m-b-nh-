import { useState } from 'react';
import { orderAPI } from '../services/api';
import { Spinner, ButtonLoading } from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { MapPin, Phone, User, Package, Calendar, MessageCircle, XCircle, Info, Truck, CreditCard, QrCode, Copy, Landmark, X, CheckCircle } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { useApi } from '../hooks/useApi';
import { SHOP_PAYMENT_CONFIG } from '../config/payment';

export default function MyOrdersPage() {
  const { orders, loading, cancelOrder, cancelLoading } = useOrders();
  const { data: detailData, loading: detailLoading, execute: fetchDetail } = useApi(orderAPI.getOrderDetail);
  const [showModal, setShowModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [repayOrder, setRepayOrder] = useState(null);
  const [repayLoading, setRepayLoading] = useState(false);
  const { showSuccess, showError, showWarning } = useToast();

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    const ok = await cancelOrder(id);
    if (ok) {
      showSuccess('Đã hủy đơn hàng thành công.');
    } else {
      showError('Không thể hủy đơn hàng.');
    }
  };

  const handleRepay = async (order) => {
    if (order.payment_method === 'TRANSFER') {
      setRepayOrder(order);
      setShowRepayModal(true);
      return;
    }

    setRepayLoading(true);
    try {
      const res = await orderAPI.repay(order.id);
      if (res.data.paymentData?.payUrl) {
        window.location.href = res.data.paymentData.payUrl;
      } else if (res.data.paymentData?.body?.payUrl) { // MoMo structure check
          window.location.href = res.data.paymentData.body.payUrl;
      } else {
          showWarning('Phương thức thanh toán này hiện đang bảo trì, vui lòng thử lại sau.');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Không thể tạo lại yêu cầu thanh toán.');
    } finally {
      setRepayLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showSuccess(`Đã sao chép ${label}!`);
  };


  const openOrderDetail = async (id) => {
    try {
      await fetchDetail(id);
      setShowModal(true);
    } catch {
      showError('Không thể lấy thông tin chi tiết đơn hàng.');
    }
  };

  const selectedOrderDetail = detailData?.data;

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#fff3cd', color: '#856404', label: 'Chờ xác nhận' },
      confirmed: { bg: '#cce5ff', color: '#004085', label: 'Đã xác nhận' },
      baking: { bg: '#efe5ff', color: '#5a32a3', label: 'Đang làm bánh' },
      shipping: { bg: '#e0f7fa', color: '#006064', label: 'Đang giao hàng' },
      completed: { bg: '#d4edda', color: '#155724', label: 'Hoàn thành' },
      cancelled: { bg: '#f8d7da', color: '#721c24', label: 'Đã hủy' }
    };
    return colors[status] || { bg: '#eee', color: '#333', label: status };
  };

  const parseAddress = (addrStr) => {
    if (!addrStr) return { name: 'Chưa cập nhật', phone: 'Chưa cập nhật', detail: 'Chưa cập nhật' };
    const parts = addrStr.split(' - ');
    if (parts.length >= 3) {
      return { 
        name: parts[0], 
        phone: parts[1], 
        detail: parts.slice(2).join(' - ') 
      };
    }
    return { name: 'Khách hàng', phone: '', detail: addrStr };
  };

  const getExpectedDate = (orderDate) => {
    const date = new Date(orderDate);
    date.setDate(date.getDate() + 2); // Dự kiến +2 ngày
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div style={{background: 'var(--bg-main)', minHeight: '100vh'}}>
      <div className="container animate-fade-in" style={{ paddingTop: '120px', paddingBottom: '60px', minHeight: '80vh' }}>
        <h1 style={{marginBottom: 30, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800}}>
          <Package size={32} color="var(--primary)" /> 📦 Quản Lý Đơn Hàng
        </h1>
        
        {loading ? (
          <div style={{textAlign: 'center', padding: '100px 0'}}><Spinner size={40} color="var(--primary)" /></div>
        ) : orders.length === 0 ? (
          <div style={{textAlign: 'center', background: 'var(--bg-light)', padding: 80, borderRadius: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)'}}>
            <div style={{fontSize: 60, marginBottom: 20}}>🛍️</div>
            <h3 style={{color: 'var(--text-muted)', marginBottom: 20, fontWeight: 700}}>Bạn chưa có đơn hàng nào</h3>
            <button className="btn-primary" onClick={() => window.location.href='/'}>Mua sắm ngay</button>
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
            {orders.map(order => {
              const statusCfg = getStatusColor(order.status);
              const addrInfo = parseAddress(order.shipping_address);
              return (
                <div key={order.id} style={{background: 'var(--bg-light)', padding: 25, borderRadius: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'}} className="order-card">
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 15, marginBottom: 15}}>
                    <div>
                      <strong style={{fontSize: 18, color: 'var(--text-main)', fontWeight: 800}}>Mã đơn: #{order.id}</strong>
                      <span style={{color: 'var(--text-muted)', marginLeft: 15, fontSize: 14}}>
                        <Calendar size={14} style={{display: 'inline', marginRight: 4, verticalAlign: 'middle'}} />
                        {new Date(order.order_date).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <span className="badge" style={{position: 'static', background: statusCfg.bg, color: statusCfg.color, fontWeight: 800, padding: '6px 15px', borderRadius: 50, fontSize: '13px'}}>
                      {statusCfg.label}
                    </span>
                  </div>
                  
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20}}>
                    <div style={{flex: 1, minWidth: '300px'}}>
                      <p style={{marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)'}}>
                        <strong style={{fontWeight: 700}}>Dự kiến giao:</strong> 
                        <span style={{color: 'var(--primary)', fontWeight: 800}}>
                          {order.status === 'completed' ? 'Đã giao' : order.status === 'cancelled' ? 'N/A' : getExpectedDate(order.order_date)}
                        </span>
                      </p>
                      <p style={{marginBottom: 8, color: 'var(--text-main)'}}><strong style={{fontWeight: 700}}>Số lượng:</strong> {order.item_count} sản phẩm</p>
                      <p style={{marginBottom: 8, color: 'var(--text-main)'}}>
                        <strong style={{fontWeight: 700}}>Thanh toán:</strong> {order.payment_method} - 
                        <span style={{
                          marginLeft: 5,
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          background: order.payment_status === 'paid' ? 'var(--success-soft)' : 'var(--bg-muted)',
                          color: order.payment_status === 'paid' ? 'var(--success)' : 'var(--text-muted)',
                          fontWeight: 800,
                          border: '1px solid currentColor'
                        }}>
                          {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </span>
                      </p>
                      <p style={{display: 'flex', alignItems: 'flex-start', gap: 5, color: 'var(--text-light)'}}>
                        <MapPin size={16} style={{marginTop: 3, flexShrink: 0}} />
                        <span><strong style={{fontWeight: 700, color: 'var(--text-main)'}}>Giao đến:</strong> {addrInfo.detail}</span>
                      </p>
                    </div>

                    <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 15}}>
                      <div>
                        <p style={{color: 'var(--text-muted)', marginBottom: 5, fontSize: 14, fontWeight: 600}}>Tổng tiền thanh toán:</p>
                        <p style={{fontSize: 28, fontWeight: 900, color: 'var(--primary)', margin: 0}}>{Number(order.final_amount).toLocaleString()}đ</p>
                      </div>
                      
                      <div style={{display: 'flex', gap: 10, justifyContent: 'flex-end'}}>
                        <button 
                          onClick={() => openOrderDetail(order.id)}
                          style={{background: 'var(--bg-muted)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '10px 20px', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 700}}
                        >
                          <Info size={16} /> Chi tiết
                        </button>

                        {order.payment_status !== 'paid' && order.status !== 'cancelled' && (
                          <button 
                            onClick={() => handleRepay(order)}
                            className="btn-primary"
                            style={{padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 20px var(--primary-soft)'}}
                          >
                            {order.payment_method === 'TRANSFER' ? <QrCode size={16} /> : <CreditCard size={16} />} 
                            Thanh toán ngay
                          </button>
                        )}


                        {(order.status === 'pending' || order.status === 'confirmed') ? (
                          <ButtonLoading 
                            isLoading={cancelLoading}
                            onClick={() => handleCancel(order.id)}
                            className="btn-outline" 
                            style={{padding: '10px 20px', borderColor: 'var(--danger)', color: 'var(--danger)', borderRadius: 12, fontSize: 14, fontWeight: 700}}
                          >
                            <XCircle size={16} style={{marginRight: 5}} /> Hủy đơn
                          </ButtonLoading>
                        ) : order.status !== 'cancelled' && order.status !== 'completed' ? (
                          <a 
                            href="tel:0901234567"
                            style={{background: 'var(--success)', color: 'white', textDecoration: 'none', padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5}}
                          >
                            <MessageCircle size={16} /> Liên hệ Shop
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && selectedOrderDetail && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.7)', zIndex: 3000, 
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: 20
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'var(--bg-light)', width: '100%', maxWidth: '600px', 
            borderRadius: 30, overflow: 'hidden', 
            animation: 'slideUp 0.3s',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-color)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{padding: '25px', background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0, fontWeight: 800}}>Chi Tiết Đơn Hàng #{selectedOrderDetail.id}</h3>
              <button onClick={() => setShowModal(false)} style={{background: 'none', border: 'none', color: 'white', fontSize: 28, cursor: 'pointer', lineHeight: 1}}>&times;</button>
            </div>
            
            <div style={{padding: 25, maxHeight: '70vh', overflowY: 'auto'}}>
              {detailLoading ? (
                <div style={{textAlign: 'center', padding: '40px 0'}}><Spinner size={30} color="var(--primary)" /></div>
              ) : (
                <>
                  <div style={{marginBottom: 25, background: 'var(--bg-muted)', padding: 20, borderRadius: 20, border: '1px solid var(--border-color)'}}>
                    <h4 style={{marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)', fontWeight: 800}}><Truck size={18} /> Thông tin vận chuyển</h4>
                    <div style={{display: 'grid', gap: 12}}>
                      <p style={{margin: 0, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)'}}><User size={14} color="var(--text-muted)" /> <strong style={{fontWeight: 700}}>Người nhận:</strong> {parseAddress(selectedOrderDetail.shipping_address).name}</p>
                      <p style={{margin: 0, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)'}}><Phone size={14} color="var(--text-muted)" /> <strong style={{fontWeight: 700}}>Số điện thoại:</strong> {parseAddress(selectedOrderDetail.shipping_address).phone}</p>
                      <p style={{margin: 0, fontSize: 14, display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--text-main)'}}><MapPin size={14} color="var(--text-muted)"  style={{marginTop: 3}} /> <strong style={{fontWeight: 700}}>Địa chỉ:</strong> {parseAddress(selectedOrderDetail.shipping_address).detail}</p>
                    </div>
                  </div>

                  <h4 style={{marginBottom: 15, color: 'var(--text-main)', fontWeight: 800}}>Sản phẩm ({selectedOrderDetail.items?.length})</h4>
                  <div style={{display: 'grid', gap: 15}}>
                    {selectedOrderDetail.items?.map((item, idx) => (
                      <div key={idx} style={{display: 'flex', gap: 15, alignItems: 'center', paddingBottom: 15, borderBottom: '1px solid var(--border-color)'}}>
                        <img src={item.thumbnail} alt={item.product_name} style={{width: 65, height: 65, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border-color)'}} />
                        <div style={{flex: 1}}>
                          <h5 style={{margin: '0 0 5px 0', color: 'var(--text-main)', fontWeight: 700}}>{item.product_name}</h5>
                          <p style={{margin: 0, fontSize: 12, color: 'var(--text-light)', fontWeight: 600}}>Size: {item.size_name} | SL: x{item.quantity}</p>
                        </div>
                        <div style={{fontWeight: 900, color: 'var(--primary)', fontSize: '16px'}}>
                          {(Number(item.unit_price) * item.quantity).toLocaleString()}đ
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{marginTop: 25, display: 'grid', gap: 12, textAlign: 'right', borderTop: '2px dashed var(--border-color)', paddingTop: 25}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-light)', fontWeight: 600}}>
                      <span>Tạm tính:</span>
                      <span style={{color: 'var(--text-main)', fontWeight: 700}}>{Number(selectedOrderDetail.total_amount).toLocaleString()}đ</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-light)', fontWeight: 600}}>
                      <span>Phí vận chuyển:</span>
                      <span style={{color: 'var(--text-main)', fontWeight: 700}}>{Number(selectedOrderDetail.shipping_fee) === 0 ? 'Miễn phí' : `${Number(selectedOrderDetail.shipping_fee).toLocaleString()}đ`}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--success)', fontWeight: 700}}>
                      <span>Giảm giá:</span>
                      <span>-{Number(selectedOrderDetail.discount_amount).toLocaleString()}đ</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 900, color: 'var(--primary)', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-color)'}}>
                      <span>Tổng cộng:</span>
                      <span>{Number(selectedOrderDetail.final_amount).toLocaleString()}đ</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div style={{padding: '20px 25px', textAlign: 'center', borderTop: '1px solid var(--border-color)'}}>
              <button className="btn-primary" style={{width: '100%', padding: '15px', borderRadius: 15, fontWeight: 800}} onClick={() => setShowModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
      {showRepayModal && repayOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.8)', zIndex: 4000, 
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: 20, backdropFilter: 'blur(8px)'
        }} onClick={() => setShowRepayModal(false)}>
          <div style={{
            background: 'var(--bg-light)', width: '100%', maxWidth: '500px', 
            borderRadius: 32, overflow: 'hidden', 
            animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowRepayModal(false)}
              style={{ position: 'absolute', top: 20, right: 20, background: 'var(--bg-muted)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
            >
              <X size={18} />
            </button>

            <div style={{padding: '40px 30px', textAlign: 'center'}}>
                <div style={{width: 60, height: 60, background: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px'}}>
                    <QrCode size={30} />
                </div>
                <h2 style={{margin: 0, color: 'var(--text-main)', fontWeight: 800, fontSize: '24px'}}>Thanh toán đơn hàng</h2>
                <p style={{color: 'var(--text-light)', marginTop: '8px', fontSize: '15px'}}>Quét mã QR dưới đây để chuyển khoản cho shop.</p>
                
                <div style={{marginTop: 30, background: 'white', padding: 20, borderRadius: 24, display: 'inline-block', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)'}}>
                  <img 
                    src={`https://img.vietqr.io/image/${SHOP_PAYMENT_CONFIG.bank.id}-${SHOP_PAYMENT_CONFIG.bank.accountNo}-compact2.png?amount=${repayOrder.final_amount}&addInfo=${encodeURIComponent(`HXH ORDER ${repayOrder.id}`)}&accountName=${encodeURIComponent(SHOP_PAYMENT_CONFIG.bank.accountName)}`}
                    alt="VietQR"
                    style={{width: 200, height: 200, objectFit: 'contain'}}
                  />
                </div>

                <div style={{marginTop: 30, textAlign: 'left', background: 'var(--bg-muted)', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border-color)'}}>
                  <div style={{padding: '15px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{fontSize: 12, color: 'var(--text-light)', fontWeight: 600}}>SỐ TÀI KHOẢN</span>
                    <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                      <strong style={{fontSize: 16, color: 'var(--text-main)'}}>{SHOP_PAYMENT_CONFIG.bank.accountNo}</strong>
                      <button onClick={() => copyToClipboard(SHOP_PAYMENT_CONFIG.bank.accountNo, 'số tài khoản')} style={{background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer'}}><Copy size={16}/></button>
                    </div>
                  </div>
                  <div style={{padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{fontSize: 12, color: 'var(--text-light)', fontWeight: 600}}>SỐ TIỀN</span>
                    <strong style={{fontSize: 18, color: 'var(--primary)', fontWeight: 900}}>{Number(repayOrder.final_amount).toLocaleString()}đ</strong>
                  </div>
                </div>

                <button 
                  className="btn-primary" 
                  style={{width: '100%', marginTop: 30, padding: 16, borderRadius: 16, fontWeight: 800, fontSize: 16}}
                  onClick={() => {
                    setShowRepayModal(false);
                    showSuccess('Cảm ơn bạn! Chúng tôi sẽ kiểm tra và xác nhận sớm nhất.');
                  }}
                >
                  Tôi đã chuyển khoản
                </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .order-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
