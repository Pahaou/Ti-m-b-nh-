
import { useState, useEffect, useCallback } from 'react';
import { adminAPI, authAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/LoadingSpinner';
import { 
  Users, ShoppingBag, DollarSign, Package, LayoutDashboard, 
  Plus, X, Tag, MessageCircle, FileSpreadsheet, Search, 
  LogOut, Settings, Bell, TrendingUp, ChevronRight, Edit3, Save, Camera
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';

import './AdminDashboard.css';

const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'baking', label: 'Đang làm bánh' },
  { value: 'shipping', label: 'Đang giao hàng' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'cancelled', label: 'Hủy đơn hàng' },
];

const NEXT_ORDER_STATUSES = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['baking', 'cancelled'],
  baking: ['shipping'],
  shipping: ['completed'],
  completed: [],
  cancelled: [],
};

const PREPAID_METHODS = ['MOMO', 'VNPAY', 'TRANSFER'];

const orderNeedsPayment = (order) =>
  PREPAID_METHODS.includes(String(order.payment_method || '').toUpperCase()) &&
  order.payment_status !== 'paid';

const canSelectOrderStatus = (order, target) => {
  if (order.status === target) return true;
  if (!NEXT_ORDER_STATUSES[order.status]?.includes(target)) return false;
  if (orderNeedsPayment(order) && !['pending', 'cancelled'].includes(target)) return false;
  return true;
};

const getProductStock = (product) =>
  product.variants?.reduce((sum, v) => sum + Number(v.stock_quantity || 0), 0) || 0;

export default function AdminDashboard() {
  const { user, logout, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  
  if (!user) return <div className="admin-layout" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><Spinner size={40} color="var(--admin-primary)" /></div>;

  // State Management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [revenueReport, setRevenueReport] = useState(null);
  const [reportFilters, setReportFilters] = useState({
    startDate: '',
    endDate: '',
    groupBy: 'day',
  });
  
  // Loading States
  const [loading, setLoading] = useState({
    stats: false,
    orders: false,
    products: false,
    coupons: false,
    reviews: false,
    chart: false,
    reports: false,
    action: false,
    users: false
  });

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);

  // Forms & Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCoupon, setEditingCoupon] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [profileForm, setProfileForm] = useState({
    fullname: '',
    phone: '',
    avatar_url: 'https://i.pravatar.cc/150?u=admin'
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullname: user.fullname || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || 'https://i.pravatar.cc/150?u=admin'
      });
    }
  }, [user]);

  // Form States
  const [productForm, setProductForm] = useState({
    name: '', base_price: '', category_id: '', image_url: '', description: '', is_best_seller: false,
    variants: [{ sku: '', size_name: 'Mặc định', price_adjustment: 0, stock_quantity: 10 }]
  });
  
  const [couponForm, setCouponForm] = useState({
    code: '', discount_type: 'percent', discount_value: '', min_order_value: 0, max_discount_amount: '', usage_limit: 100,
    valid_from: '', valid_until: ''
  });

  // Data Fetching Logic
  const fetchData = useCallback(async (tab) => {
    setLoading(prev => ({ ...prev, [tab]: true }));
    try {
      let res;
      switch (tab) {
        case 'stats':
          res = await adminAPI.getStats();
          setStats(res.data.data);
          break;
        case 'orders':
          res = await adminAPI.getOrders();
          setOrders(res.data.data);
          break;
        case 'categories':
        case 'products':
          const [pRes, cRes] = await Promise.all([adminAPI.getProducts(), adminAPI.getCategories()]);
          setProducts(pRes.data.data);
          setCategories(cRes.data.data);
          break;
        case 'coupons':
          res = await adminAPI.getCoupons();
          setCoupons(res.data.data);
          break;
        case 'reviews':
          res = await adminAPI.getReviews();
          setReviews(res.data.data);
          break;
        case 'users':
          res = await adminAPI.getUsers();
          setUsers(res.data.data);
          break;
        case 'chart':
          res = await adminAPI.getChartData();
          setChartData(res.data.data);
          break;
      }
    } catch (err) {
      showError(`Lỗi tải dữ liệu ${tab}`);
    } finally {
      setLoading(prev => ({ ...prev, [tab]: false }));
    }
  }, [showError]);

  const fetchRevenueReport = useCallback(async (filters = reportFilters) => {
    setLoading(prev => ({ ...prev, reports: true }));
    try {
      const res = await adminAPI.getRevenueReport({
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        groupBy: filters.groupBy,
      });
      setRevenueReport(res.data.data);
    } catch (err) {
      showError(err.response?.data?.message || 'Lỗi tải báo cáo doanh thu');
    } finally {
      setLoading(prev => ({ ...prev, reports: false }));
    }
  }, [reportFilters, showError]);

  const handleExportRevenue = async () => {
    setLoading(prev => ({ ...prev, action: true }));
    try {
      const res = await adminAPI.exportRevenueReport({
        startDate: reportFilters.startDate || undefined,
        endDate: reportFilters.endDate || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `bao-cao-doanh-thu-${reportFilters.startDate || 'all'}-${reportFilters.endDate || 'all'}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      showSuccess('Đã xuất file Excel');
    } catch {
      showError('Lỗi xuất báo cáo');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchData('stats');
      fetchData('chart');
    } else if (activeTab === 'reports') {
      fetchRevenueReport();
    } else {
      fetchData(activeTab);
    }
  }, [activeTab, fetchData, fetchRevenueReport]);

  // Handlers
  const handleOrderStatusUpdate = async (id, status) => {
    try {
      await adminAPI.updateOrderStatus(id, status);
      showSuccess(`Đã cập nhật trạng thái đơn #${id}`);
      fetchData('orders');
    } catch (err) {
      showError(err.response?.data?.message || 'Loi cap nhat trang thai');
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, action: true }));
    try {
      const payload = {
        ...productForm,
        base_price: Number(productForm.base_price),
        category_id: Number(productForm.category_id),
        variants: productForm.variants.map(v => ({
          ...v,
          price_adjustment: Number(v.price_adjustment),
          stock_quantity: Number(v.stock_quantity)
        }))
      };

      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct.id, payload);
        showSuccess('Cập nhật sản phẩm thành công!');
      } else {
        await adminAPI.addProduct(payload);
        showSuccess('Thêm sản phẩm thành công!');
      }
      setShowProductModal(false);
      fetchData('products');
    } catch (err) {
      showError(err.response?.data?.message || 'Lỗi xử lý sản phẩm');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, action: true }));
    try {
      await authAPI.updateProfile({
        fullname: profileForm.fullname,
        phone: profileForm.phone
      });
      // Mock update for context
      updateUser({ ...user, fullname: profileForm.fullname, phone: profileForm.phone, avatar_url: profileForm.avatar_url });
      showSuccess('Cập nhật hồ sơ thành công!');
      setShowProfileModal(false);
    } catch (err) {
      showError('Lỗi cập nhật hồ sơ');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await adminAPI.uploadImage(formData);
      setProfileForm(prev => ({ ...prev, avatar_url: res.data.url }));
      showSuccess('Tải ảnh lên thành công!');
    } catch (err) {
      showError('Lỗi tải ảnh');
    }
  };

  // Helper Renders
  const getStockClass = (totalStock) => {
    if (totalStock <= 5) return 'stock-low';
    if (totalStock <= 20) return 'stock-mid';
    return 'stock-high';
  };

  const renderStats = () => (
    <div className="admin-stats-grid">
      <div className="stat-card">
        <div className="stat-icon" style={{background: '#e3f2fd', color: '#1976d2'}}><DollarSign /></div>
        <div className="stat-info">
          <h3>Doanh thu thực tế</h3>
          <div className="value">{Number(stats?.totalRevenue || 0).toLocaleString()}đ</div>
          <p style={{fontSize: 10, color: 'var(--admin-text-muted)'}}>(Đơn hoàn thành)</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon" style={{background: '#fff3e0', color: '#f57c00'}}><TrendingUp /></div>
        <div className="stat-info">
          <h3>Doanh thu dự kiến</h3>
          <div className="value">{Number(stats?.potentialRevenue || 0).toLocaleString()}đ</div>
          <p style={{fontSize: 10, color: 'var(--admin-text-muted)'}}>(Tổng đơn hàng)</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon" style={{background: '#f1f8e9', color: '#388e3c'}}><Package /></div>
        <div className="stat-info">
          <h3>Sản phẩm</h3>
          <div className="value">{stats?.totalProducts || 0}</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon" style={{background: '#f3e5f5', color: '#7b1fa2'}}><Users /></div>
        <div className="stat-info">
          <h3>Khách hàng</h3>
          <div className="value">{stats?.totalCustomers || 0}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <TrendingUp size={32} />
          <span>HXH ADMIN</span>
        </div>
        
        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> Tổng quan
          </button>
          <button className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <ShoppingBag size={20} /> Đơn hàng
          </button>
          <button className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            <Package size={20} /> Sản phẩm
          </button>
          <button className={`admin-nav-item ${activeTab === 'coupons' ? 'active' : ''}`} onClick={() => setActiveTab('coupons')}>
            <Tag size={20} /> Khuyến mãi
          </button>
          <button className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <Users size={20} /> Khách hàng
          </button>
          <button className={`admin-nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <DollarSign size={20} /> Báo cáo DT
          </button>
          <button className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
            <FileSpreadsheet size={20} /> Danh mục
          </button>
          <button className={`admin-nav-item ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
            <MessageCircle size={20} /> Đánh giá
          </button>
        </nav>

        <div style={{marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--admin-border)'}}>
          <a href="/" className="admin-nav-item">
            <TrendingUp size={20} style={{transform: 'rotate(-90deg)'}} /> Xem Website
          </a>
          <button className="admin-nav-item" style={{color: '#ff5252'}} onClick={logout}>
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-title">
            <h1>Chào buổi sáng, {user?.fullname}!</h1>
            <p>Dưới đây là những gì đang diễn ra với cửa hàng của bạn hôm nay.</p>
          </div>

          <div className="admin-profile-trigger" onClick={() => setShowProfileModal(true)}>
            <img src={profileForm.avatar_url} alt="Admin" className="admin-avatar" />
            <div className="admin-info">
              <span className="admin-name">{user?.fullname}</span>
              <span className="admin-role">Quản trị viên</span>
            </div>
            <ChevronRight size={16} />
          </div>
        </header>

        <div className="animate-admin">
          {activeTab === 'dashboard' && (
            <>
              {renderStats()}
              <div className="admin-stats-grid" style={{gridTemplateColumns: '2fr 1fr'}}>
                <div className="admin-card">
                  <div className="admin-card-header">
                    <h3>Doanh thu 7 ngày qua</h3>
                  </div>
                  <div style={{height: 300}}>
                    {loading.chart ? <Spinner /> : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--admin-primary)" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="var(--admin-primary)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                          <Tooltip />
                          <Area type="monotone" dataKey="revenue" stroke="var(--admin-primary)" strokeWidth={3} fill="url(#colorRevenue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
                <div className="admin-card">
                  <div className="admin-card-header">
                    <h3>Đơn hàng mới</h3>
                  </div>
                  <div className="admin-list">
                    {(stats?.recentOrders || []).map(o => (
                      <div key={o.id} style={{padding: '15px 0', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div>
                          <div style={{fontWeight: 700}}>#{o.id} - {o.fullname}</div>
                          <div style={{fontSize: 12, color: 'var(--admin-text-muted)'}}>{new Date(o.order_date).toLocaleDateString()}</div>
                        </div>
                        <div style={{fontWeight: 800, color: 'var(--admin-primary)'}}>{Number(o.final_amount).toLocaleString()}đ</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'products' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <div style={{display: 'flex', gap: 20, alignItems: 'center'}}>
                  <h3>Danh sách sản phẩm</h3>
                  <div style={{position: 'relative', width: 300}}>
                    <Search size={16} style={{position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#888'}} />
                    <input 
                      className="admin-form-control" 
                      placeholder="Tìm tên bánh..." 
                      style={{paddingLeft: 40, borderRadius: 30}}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <button className="btn-admin btn-admin-primary" onClick={() => {setEditingProduct(null); setShowProductModal(true);}}>
                  <Plus size={18} /> Thêm bánh mới
                </button>
              </div>
              
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ảnh</th>
                      <th>Mã/Tên sản phẩm</th>
                      <th>Danh mục</th>
                      <th>Giá cơ bản</th>
                      <th>Tồn kho</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => {
                      const totalStock = p.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || 0;
                      return (
                        <tr key={p.id}>
                          <td data-label="Ảnh"><img src={p.thumbnail} alt="" style={{width: 50, height: 50, borderRadius: 12, objectFit: 'cover'}} /></td>
                          <td data-label="Mã/Tên sản phẩm">
                            <div style={{fontSize: 11, color: 'var(--admin-text-muted)', fontWeight: 700}}>#PROD-{p.id}</div>
                            <div style={{fontWeight: 700}}>{p.name}</div>
                            {p.is_best_seller && <span style={{fontSize: 10, color: '#f57c00', fontWeight: 800}}>★ BEST SELLER</span>}
                          </td>
                          <td data-label="Danh mục">{p.category_name}</td>
                          <td data-label="Giá cơ bản" style={{fontWeight: 700}}>{Number(p.base_price).toLocaleString()}đ</td>
                          <td data-label="Tồn kho">
                            <span className={`stock-badge ${getStockClass(totalStock)}`}>
                              {totalStock} cái
                            </span>
                          </td>
                          <td data-label="Thao tác">
                            <button className="btn-admin btn-admin-outline" onClick={() => {
                              setEditingProduct(p);
                              setProductForm({...p, variants: p.variants || []});
                              setShowProductModal(true);
                            }}>Sửa</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Quản lý đơn hàng</h3>
              </div>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Khách hàng</th>
                      <th>Ngày đặt</th>
                      <th>Tổng tiền</th>
                      <th>Thanh toán</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td data-label="Mã đơn" style={{fontWeight: 800}}>#{o.id}</td>
                        <td data-label="Khách hàng">
                          <div style={{fontWeight: 600}}>{o.fullname}</div>
                          <div style={{fontSize: 12, color: 'var(--admin-text-muted)'}}>{o.phone}</div>
                        </td>
                        <td data-label="Ngày đặt">{new Date(o.order_date).toLocaleDateString()}</td>
                        <td data-label="Tổng tiền" style={{fontWeight: 800, color: 'var(--admin-primary)'}}>{Number(o.final_amount).toLocaleString()}đ</td>
                        <td data-label="Thanh toán">
                          <span className={`status-badge ${o.payment_status === 'paid' ? 'status-completed' : 'status-pending'}`} style={{fontSize: '11px'}}>
                            {o.payment_status === 'paid' ? '✅ Đã trả' : '⏳ Chờ tiền'}
                          </span>
                          <div style={{fontSize: '10px', marginTop: '4px', color: 'var(--admin-text-muted)', fontWeight: 600}}>
                            {o.payment_method === 'COD' ? 'Tiền mặt' : o.payment_method === 'TRANSFER' ? 'VietQR' : o.payment_method === 'MOMO' ? 'MoMo' : 'VNPay'}
                          </div>
                        </td>
                        <td data-label="Trạng thái">
                          <span className={`status-badge status-${o.status}`}>
                            {o.status === 'pending' ? 'Chờ duyệt' : o.status === 'confirmed' ? 'Đã xác nhận' : o.status === 'baking' ? 'Đang làm' : o.status === 'shipping' ? 'Đang giao' : o.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                          </span>
                        </td>
                        <td data-label="Thao tác">
                          <div style={{display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end'}}>
                            {orderNeedsPayment(o) && (
                              <button
                                type="button"
                                className="btn-admin btn-admin-primary"
                                style={{ padding: '8px 12px', fontSize: '11px', whiteSpace: 'nowrap', minWidth: 'auto' }}
                                onClick={async () => {
                                  if (window.confirm(`Xác nhận đã nhận ${Number(o.final_amount).toLocaleString()}đ cho đơn #${o.id}?`)) {
                                    try {
                                      await adminAPI.confirmPayment(o.id);
                                      showSuccess('Đã xác nhận thanh toán — khách sẽ thấy đơn đã xác nhận.');
                                      fetchData('orders');
                                    } catch (err) {
                                      showError(err.response?.data?.message || 'Lỗi xác nhận thanh toán');
                                    }
                                  }
                                }}
                              >
                                Xác nhận tiền
                              </button>
                            )}
                            <select 
                              className="admin-form-control" 
                              style={{width: 130, padding: '8px 12px', fontSize: 13, borderColor: 'var(--admin-primary)'}}
                              value={o.status}
                              onChange={(e) => {
                                if(e.target.value !== o.status) {
                                  handleOrderStatusUpdate(o.id, e.target.value);
                                }
                              }}
                            >
                              {ORDER_STATUS_OPTIONS.map((status) => (
                                <option
                                  key={status.value}
                                  value={status.value}
                                  disabled={!canSelectOrderStatus(o, status.value)}
                                >
                                  {status.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'coupons' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Quản lý khuyến mãi</h3>
                <button className="btn-admin btn-admin-primary" onClick={() => {setEditingCoupon(null); setCouponForm({code: '', discount_type: 'percent', discount_value: '', min_order_value: 0, max_discount_amount: '', usage_limit: 100, valid_from: '', valid_until: ''}); setShowCouponModal(true);}}>
                  <Plus size={18} /> Thêm mã mới
                </button>
              </div>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã</th>
                      <th>Giảm giá</th>
                      <th>Đơn tối thiểu</th>
                      <th>Giảm tối đa</th>
                      <th>Lượt dùng</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(c => (
                      <tr key={c.id}>
                        <td data-label="Mã" style={{fontWeight: 800}}>{c.code}</td>
                        <td data-label="Giảm giá" style={{fontWeight: 700, color: 'var(--admin-primary)'}}>
                          {c.discount_type === 'percent' ? `${c.discount_value}%` : `${Number(c.discount_value).toLocaleString()}đ`}
                        </td>
                        <td data-label="Đơn tối thiểu">{Number(c.min_order_value).toLocaleString()}đ</td>
                        <td data-label="Giảm tối đa">{c.max_discount_amount ? `${Number(c.max_discount_amount).toLocaleString()}đ` : 'Không giới hạn'}</td>
                        <td data-label="Lượt dùng">{c.usage_limit ? `${Number(c.used_count || 0).toLocaleString()}/${Number(c.usage_limit).toLocaleString()}` : 'Không giới hạn'}</td>
                        <td data-label="Trạng thái">
                          <span className={`status-badge ${c.is_active ? 'status-completed' : 'status-cancelled'}`}>
                            {c.is_active ? 'Đang chạy' : 'Đã dừng'}
                          </span>
                        </td>
                        <td data-label="Thao tác">
                          <div style={{display: 'flex', gap: 10, justifyContent: 'flex-end'}}>
                            <button className="btn-admin btn-admin-outline" onClick={() => {
                              setEditingCoupon(c);
                              setCouponForm({...c, valid_from: c.valid_from?.split('T')[0], valid_until: c.valid_until?.split('T')[0]});
                              setShowCouponModal(true);
                            }}><Edit3 size={16} /></button>
                            <button className="btn-admin btn-admin-outline" style={{color: c.is_active ? '#ffc107' : '#28a745'}} onClick={async () => {
                              try {
                                await adminAPI.updateCoupon(c.id, { is_active: !c.is_active });
                                showSuccess(c.is_active ? 'Đã tạm dừng' : 'Đã kích hoạt');
                                fetchData('coupons');
                              } catch (err) { showError('Lỗi cập nhật'); }
                            }}>{c.is_active ? 'Dừng' : 'Bật'}</button>
                            <button className="btn-admin btn-admin-outline" style={{color: '#ff5252'}} onClick={async () => {
                              if(window.confirm('Ẩn mã này?')) {
                                try {
                                  await adminAPI.deleteCoupon(c.id);
                                  showSuccess('Đã ẩn mã');
                                  fetchData('coupons');
                                } catch (err) { showError('Lỗi xóa'); }
                              }
                            }}><X size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Báo cáo doanh thu</h3>
                <button type="button" className="btn-admin btn-admin-primary" disabled={loading.action} onClick={handleExportRevenue}>
                  <FileSpreadsheet size={18} /> Xuất Excel
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20, alignItems: 'flex-end' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                  Từ ngày
                  <input type="date" className="admin-input" value={reportFilters.startDate} onChange={(e) => setReportFilters((f) => ({ ...f, startDate: e.target.value }))} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                  Đến ngày
                  <input type="date" className="admin-input" value={reportFilters.endDate} onChange={(e) => setReportFilters((f) => ({ ...f, endDate: e.target.value }))} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                  Nhóm theo
                  <select className="admin-input" value={reportFilters.groupBy} onChange={(e) => setReportFilters((f) => ({ ...f, groupBy: e.target.value }))}>
                    <option value="day">Theo ngày</option>
                    <option value="month">Theo tháng</option>
                    <option value="year">Theo năm</option>
                  </select>
                </label>
                <button type="button" className="btn-admin btn-admin-outline" onClick={() => fetchRevenueReport()}>Áp dụng</button>
              </div>
              {loading.reports ? <Spinner /> : (
                <>
                  <div className="admin-stats-grid" style={{ marginBottom: 20 }}>
                    <div className="stat-card"><div className="stat-info"><h3>Tổng doanh thu</h3><div className="value">{Number(revenueReport?.totals?.grand_total || 0).toLocaleString()}đ</div></div></div>
                    <div className="stat-card"><div className="stat-info"><h3>Đơn hoàn thành</h3><div className="value">{revenueReport?.totals?.total_orders || 0}</div></div></div>
                    <div className="stat-card"><div className="stat-info"><h3>Doanh thu hàng lỗi</h3><div className="value" style={{ color: '#e65100' }}>{Number(revenueReport?.totals?.defect_revenue || 0).toLocaleString()}đ</div></div></div>
                  </div>
                  <h4 style={{ marginBottom: 12 }}>Theo kỳ</h4>
                  <div className="table-responsive" style={{ marginBottom: 24 }}>
                    <table className="admin-table">
                      <thead><tr><th>Kỳ</th><th>Doanh thu</th><th>Số đơn</th><th>TB/đơn</th></tr></thead>
                      <tbody>
                        {(revenueReport?.summary || []).map((row) => (
                          <tr key={row.period}>
                            <td>{row.period}</td>
                            <td>{Number(row.total_revenue).toLocaleString()}đ</td>
                            <td>{row.order_count}</td>
                            <td>{Number(row.average_order_value || 0).toLocaleString()}đ</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <h4 style={{ marginBottom: 12 }}>Theo danh mục</h4>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead><tr><th>Danh mục</th><th>Loại</th><th>Số lượng</th><th>Doanh thu</th></tr></thead>
                      <tbody>
                        {(revenueReport?.byCategory || []).map((row) => (
                          <tr key={row.category_name}>
                            <td style={{ fontWeight: 700 }}>{row.category_name}</td>
                            <td>{row.is_defect ? <span className="status-badge status-cancelled">Hàng lỗi</span> : 'Thường'}</td>
                            <td>{row.units_sold}</td>
                            <td>{Number(row.revenue).toLocaleString()}đ</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Quản lý danh mục</h3>
                <button className="btn-admin btn-admin-primary" onClick={() => {
                  const name = window.prompt('Nhập tên danh mục mới:');
                  if(name) {
                    const isDefect = window.confirm('Đây là danh mục hàng bị lỗi / thanh lý?');
                    adminAPI.addCategory({ name, is_defect: isDefect }).then(() => {
                      showSuccess('Đã thêm');
                      fetchData('categories');
                    }).catch((err) => showError(err.response?.data?.message || 'Lỗi thêm'));
                  }
                }}>+ Thêm loại bánh</button>
              </div>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên danh mục</th>
                      <th>Loại</th>
                      <th>Sản phẩm</th>
                      <th>Tồn kho</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(cat => (
                      <tr key={cat.id}>
                        <td data-label="ID">#{cat.id}</td>
                        <td data-label="Tên danh mục" style={{fontWeight: 700}}>{cat.name}</td>
                        <td data-label="Loại">{cat.is_defect ? <span className="status-badge status-cancelled">Hàng lỗi</span> : 'Thường'}</td>
                        <td data-label="Sản phẩm">{cat.product_count ?? products.filter(p => p.category_id === cat.id).length} SP</td>
                        <td data-label="Tồn kho">
                          <span className={`stock-badge ${getStockClass(Number(cat.total_stock ?? products.filter(p => p.category_id === cat.id).reduce((s, p) => s + getProductStock(p), 0)))}`}>
                            {Number(cat.total_stock ?? products.filter(p => p.category_id === cat.id).reduce((s, p) => s + getProductStock(p), 0))}
                          </span>
                        </td>
                        <td data-label="Thao tác">
                          <div style={{display: 'flex', gap: 10, justifyContent: 'flex-end'}}>
                            <button className="btn-admin btn-admin-outline" title="Sửa tên" onClick={() => {
                              const newName = window.prompt('Nhập tên mới cho danh mục:', cat.name);
                              if(newName && newName !== cat.name) {
                                adminAPI.updateCategory(cat.id, { name: newName }).then(() => {
                                  showSuccess('Đã cập nhật');
                                  fetchData('categories');
                                }).catch(() => showError('Lỗi cập nhật'));
                              }
                            }}><Edit3 size={16} /></button>
                            <button className="btn-admin btn-admin-outline" style={{color: '#ff5252'}} title="Xóa danh mục" onClick={async () => {
                              if(window.confirm(`Xóa danh mục "${cat.name}"?`)) {
                                try {
                                  await adminAPI.deleteCategory(cat.id);
                                  showSuccess('Đã xóa');
                                  fetchData('categories');
                                } catch (err) { showError('Không thể xóa danh mục đang có sản phẩm!'); }
                              }
                            }}><X size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Quản lý khách hàng</h3>
              </div>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Khách hàng</th>
                      <th>Điểm tích lũy</th>
                      <th>Số điện thoại</th>
                      <th>Ngày gia nhập</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td data-label="Khách hàng">
                          <div style={{fontWeight: 700}}>{u.fullname}</div>
                          <div style={{fontSize: 12, color: 'var(--admin-text-muted)'}}>{u.email}</div>
                        </td>
                        <td data-label="Điểm tích lũy" style={{fontWeight: 700, color: 'var(--admin-primary)'}}>{u.loyalty_points || 0} điểm</td>
                        <td data-label="Số điện thoại">{u.phone || 'N/A'}</td>
                        <td data-label="Ngày gia nhập">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td data-label="Thao tác">
                          <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                            <button className="btn-admin btn-admin-outline" onClick={async () => {
                              setSelectedUser(u);
                              const res = await adminAPI.getOrders(); // Simplified: filter from all orders for now
                              setUserOrders(res.data.data.filter(o => o.user_id === u.id));
                            }}>Xem chi tiết</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Đánh giá khách hàng</h3>
              </div>
              <div className="admin-list">
                {reviews.map(r => (
                  <div key={r.id} style={{padding: '20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', gap: 20}}>
                    <img src={r.thumbnail} alt="" style={{width: 60, height: 60, borderRadius: 15, objectFit: 'cover'}} />
                    <div style={{flex: 1}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 5}}>
                        <span style={{fontWeight: 700}}>{r.fullname}</span>
                        <span style={{color: '#f1c40f'}}>{'â˜…'.repeat(r.rating)}{'â˜†'.repeat(5-r.rating)}</span>
                      </div>
                      <div style={{fontSize: 13, fontWeight: 600, color: 'var(--admin-text-main)'}}>{r.product_name}</div>
                      <p style={{margin: '8px 0', fontSize: 14, color: 'var(--admin-text-muted)'}}>{r.comment}</p>
                      <div style={{fontSize: 12, color: 'var(--admin-text-muted)'}}>{new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCouponModal(false)}>
          <div className="admin-modal animate-admin" onClick={e => e.stopPropagation()}>
            <div className="admin-card-header">
              <h3>{editingCoupon ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi'}</h3>
              <button className="btn-admin btn-admin-outline" onClick={() => setShowCouponModal(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(prev => ({...prev, action: true}));
              try {
                if (editingCoupon) {
                  await adminAPI.updateCoupon(editingCoupon.id, couponForm);
                  showSuccess('Cập nhật thành công!');
                } else {
                  await adminAPI.addCoupon(couponForm);
                  showSuccess('Thêm mới thành công!');
                }
                setShowCouponModal(false);
                fetchData('coupons');
              } catch (err) {
                showError(err.response?.data?.message || 'Lỗi xử lý khuyến mãi');
              } finally {
                setLoading(prev => ({...prev, action: false}));
              }
            }}>
              <div className="admin-form-group">
                <label>Mã khuyến mãi *</label>
                <input className="admin-form-control" style={{textTransform: 'uppercase'}} value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} required />
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
                <div className="admin-form-group">
                  <label>Loại giảm giá</label>
                  <select className="admin-form-control" value={couponForm.discount_type} onChange={e => setCouponForm({...couponForm, discount_type: e.target.value})}>
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Số tiền (đ)</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Giá trị giảm *</label>
                  <input type="number" className="admin-form-control" value={couponForm.discount_value} onChange={e => setCouponForm({...couponForm, discount_value: e.target.value})} required />
                </div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
                <div className="admin-form-group">
                  <label>Đơn tối thiểu (đ)</label>
                  <input type="number" className="admin-form-control" value={couponForm.min_order_value} onChange={e => setCouponForm({...couponForm, min_order_value: e.target.value})} />
                </div>
                <div className="admin-form-group">
                  <label>Giảm tối đa (đ)</label>
                  <input type="number" className="admin-form-control" value={couponForm.max_discount_amount || ''} onChange={e => setCouponForm({...couponForm, max_discount_amount: e.target.value})} placeholder="Để trống nếu không giới hạn" />
                </div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
                <div className="admin-form-group">
                  <label>Lượt dùng tối đa</label>
                  <input type="number" className="admin-form-control" value={couponForm.usage_limit} onChange={e => setCouponForm({...couponForm, usage_limit: e.target.value})} />
                </div>
              </div>
              <div style={{display: 'flex', gap: 15, marginTop: 30}}>
                <button type="submit" className="btn-admin btn-admin-primary" style={{flex: 1}} disabled={loading.action}>
                  {loading.action ? 'Đang lưu...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="admin-modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="admin-modal animate-admin" onClick={e => e.stopPropagation()}>
            <div className="admin-card-header">
              <h3>Hồ sơ quản trị viên</h3>
              <button className="btn-admin btn-admin-outline" onClick={() => setShowProfileModal(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleProfileUpdate}>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 30}}>
                <div style={{position: 'relative'}}>
                  <img src={profileForm.avatar_url} alt="Avatar" style={{width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '4px solid white', boxShadow: 'var(--admin-shadow)'}} />
                  <label style={{position: 'absolute', bottom: 5, right: 5, background: 'var(--admin-primary)', color: 'white', width: 35, height: 35, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '3px solid white'}}>
                    <Camera size={18} />
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Họ và tên</label>
                <input className="admin-form-control" value={profileForm.fullname} onChange={e => setProfileForm({...profileForm, fullname: e.target.value})} required />
              </div>

              <div className="admin-form-group">
                <label>Số điện thoại</label>
                <input className="admin-form-control" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
              </div>

              <div style={{display: 'flex', gap: 15, marginTop: 40}}>
                <button type="submit" className="btn-admin btn-admin-primary" style={{flex: 1}} disabled={loading.action}>
                  {loading.action ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="admin-modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="admin-modal animate-admin" style={{maxWidth: 800}} onClick={e => e.stopPropagation()}>
            <div className="admin-card-header">
              <h3>{editingProduct ? 'Chỉnh sửa bánh' : 'Thêm bánh mới'}</h3>
              <button className="btn-admin btn-admin-outline" onClick={() => setShowProductModal(false)}><X size={20}/></button>
            </div>

            <form onSubmit={handleProductSubmit}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
                <div className="admin-form-group">
                  <label>Tên sản phẩm *</label>
                  <input className="admin-form-control" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
                </div>
                <div className="admin-form-group">
                  <label>Danh mục *</label>
                  <select className="admin-form-control" value={productForm.category_id} onChange={e => setProductForm({...productForm, category_id: e.target.value})} required>
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
                <div className="admin-form-group">
                  <label>Giá cơ bản (đ) *</label>
                  <input type="number" className="admin-form-control" value={productForm.base_price} onChange={e => setProductForm({...productForm, base_price: e.target.value})} required />
                </div>
                <div className="admin-form-group">
                  <label>URL Ảnh *</label>
                  <input className="admin-form-control" value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} required />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Mô tả sản phẩm</label>
                <textarea className="admin-form-control" rows="3" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
              </div>

              {/* Variants Section */}
              <div style={{marginTop: 20}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 15}}>
                  <label style={{fontWeight: 800}}>Phân loại (Size / Kiểu)</label>
                  <button type="button" className="btn-admin btn-admin-outline" style={{padding: '5px 15px'}} onClick={() => setProductForm({...productForm, variants: [...productForm.variants, {size_name: '', price_adjustment: 0, stock_quantity: 10}]})}>
                    + Thêm size
                  </button>
                </div>
                {productForm.variants.map((v, i) => (
                  <div key={i} style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 10, marginBottom: 10}}>
                    <input className="admin-form-control" placeholder="Mã SKU" value={v.sku || ''} onChange={e => {
                      const newVariants = [...productForm.variants];
                      newVariants[i].sku = e.target.value;
                      setProductForm({...productForm, variants: newVariants});
                    }} />
                    <input className="admin-form-control" placeholder="Tên size" value={v.size_name} onChange={e => {
                      const newVariants = [...productForm.variants];
                      newVariants[i].size_name = e.target.value;
                      setProductForm({...productForm, variants: newVariants});
                    }} />
                    <input type="number" className="admin-form-control" placeholder="Giá cộng thêm" min="0" value={v.price_adjustment} onChange={e => {
                      const newVariants = [...productForm.variants];
                      newVariants[i].price_adjustment = Math.max(0, Number(e.target.value));
                      setProductForm({...productForm, variants: newVariants});
                    }} />
                    <input type="number" className="admin-form-control" placeholder="Tồn kho" min="0" value={v.stock_quantity} onChange={e => {
                      const newVariants = [...productForm.variants];
                      newVariants[i].stock_quantity = Math.max(0, Number(e.target.value));
                      setProductForm({...productForm, variants: newVariants});
                    }} />
                    <button type="button" className="btn-admin btn-admin-outline" style={{padding: '10px', color: '#ff5252'}} onClick={() => {
                      const newVariants = productForm.variants.filter((_, idx) => idx !== i);
                      setProductForm({...productForm, variants: newVariants});
                    }}><X size={18} /></button>
                  </div>
                ))}
              </div>

              <div style={{marginTop: 30, display: 'flex', gap: 15}}>
                <button type="submit" className="btn-admin btn-admin-primary" style={{flex: 1}} disabled={loading.action}>
                  {loading.action ? 'Đang lưu...' : (editingProduct ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Customer Detail Modal */}
      {selectedUser && (
        <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="admin-modal animate-admin" style={{maxWidth: 900}} onClick={e => e.stopPropagation()}>
            <div className="admin-card-header">
              <h3>Chi tiết khách hàng: {selectedUser.fullname}</h3>
              <button className="btn-admin btn-admin-outline" onClick={() => setSelectedUser(null)}><X size={20}/></button>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 30}}>
              <div>
                <div className="admin-card" style={{padding: 25, textAlign: 'center'}}>
                  <div style={{width: 100, height: 100, background: 'var(--admin-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 800, margin: '0 auto 15px', boxShadow: '0 8px 20px rgba(196, 92, 106, 0.2)'}}>
                    {selectedUser.fullname[0]}
                  </div>
                  <h4 style={{fontSize: 20, marginBottom: 5, color: 'var(--admin-text-main)'}}>{selectedUser.fullname}</h4>
                  <div style={{display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 20}}>
                     <span className={`status-badge status-${selectedUser.membership_tier || 'bronze'}`} style={{textTransform: 'uppercase', fontSize: 10, fontWeight: 800}}>
                        {selectedUser.membership_tier || 'Bronze'}
                     </span>
                  </div>

                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 25}}>
                     <div style={{background: 'var(--admin-bg-muted)', padding: '15px 10px', borderRadius: 15}}>
                        <div style={{fontSize: 11, color: 'var(--admin-text-muted)', marginBottom: 5}}>ĐIỂM TÍCH LŨY</div>
                        <div style={{fontSize: 18, fontWeight: 900, color: 'var(--admin-primary)'}}>{selectedUser.loyalty_points || 0}</div>
                     </div>
                     <div style={{background: 'var(--admin-bg-muted)', padding: '15px 10px', borderRadius: 15}}>
                        <div style={{fontSize: 11, color: 'var(--admin-text-muted)', marginBottom: 5}}>TỔNG CHI TIÊU</div>
                        <div style={{fontSize: 16, fontWeight: 900, color: 'var(--admin-text-main)'}}>{Number(selectedUser.total_spent || 0).toLocaleString()}đ</div>
                     </div>
                  </div>

                  <div style={{textAlign: 'left', display: 'grid', gap: 12, fontSize: 14, color: 'var(--admin-text-main)', padding: '15px', background: 'var(--admin-surface)', borderRadius: 15, border: '1px solid var(--admin-border)'}}>
                    <p style={{margin: 0}}><strong>Email:</strong> {selectedUser.email}</p>
                    <p style={{margin: 0}}><strong>SĐT:</strong> {selectedUser.phone || 'N/A'}</p>
                    <p style={{margin: 0, fontSize: 12, color: 'var(--admin-text-muted)'}}>Tham gia: {new Date(selectedUser.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              </div>

              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
                   <h4 style={{margin: 0}}>Lịch sử đơn hàng</h4>
                   <span style={{fontSize: 13, color: 'var(--admin-text-muted)'}}>{userOrders.length} đơn hàng</span>
                </div>
                <div className="table-responsive" style={{maxHeight: 450, borderRadius: 15, border: '1px solid var(--admin-border)'}}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Ngày đặt</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userOrders.length === 0 ? (
                        <tr><td colSpan="4" style={{textAlign: 'center', padding: 40, color: 'var(--admin-text-muted)'}}>Chưa có đơn hàng nào</td></tr>
                      ) : (
                        userOrders.map(o => (
                          <tr key={o.id}>
                            <td style={{fontWeight: 700}}>#{o.id}</td>
                            <td>{new Date(o.order_date).toLocaleDateString('vi-VN')}</td>
                            <td style={{fontWeight: 800, color: 'var(--admin-primary)'}}>{Number(o.final_amount).toLocaleString()}đ</td>
                            <td>
                              <span className={`status-badge status-${o.status}`}>
                                {o.status === 'pending' ? 'Chờ duyệt' : 
                                 o.status === 'confirmed' ? 'Đã xác nhận' :
                                 o.status === 'baking' ? 'Đang làm bánh' :
                                 o.status === 'shipping' ? 'Đang giao' :
                                 o.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
