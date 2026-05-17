import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if auth error (401 Unauthorized)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/users/login', data),
  logout: () => api.post('/users/logout'),
  register: (data) => api.post('/users/register', data),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  addAddress: (data) => api.post('/users/addresses', data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  forgotPassword: (data) => api.post('/users/forgot-password', data),
  resetPassword: (data) => api.post('/users/reset-password', data),
};

export const productAPI = {
  /** @param {Record<string, string|number|boolean|undefined>} params - page, limit, q, categoryId, minPrice, maxPrice, bestSeller, sort */
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  getSuggestions: (params) => api.get('/products/suggestions', { params }),
};

export const cartAPI = {
  getCart: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  updateQuantity: (id, quantity) => api.put(`/cart/${id}`, { quantity }),
  remove: (id) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart/clear'),
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders'),
  getOrderDetail: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  repay: (id) => api.post(`/orders/${id}/repay`),
  validateCoupon: (data) => api.post('/orders/validate-coupon', data),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getProducts: () => api.get('/admin/products'),
  addProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  getOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  confirmPayment: (id) => api.post(`/admin/orders/${id}/confirm-payment`),
  getUsers: () => api.get('/admin/users'),
  getCategories: () => api.get('/admin/categories'),
  addCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  getCoupons: () => api.get('/admin/coupons'),
  addCoupon: (data) => api.post('/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
  getReviews: (params) => api.get('/admin/reviews', { params }),
  seed: () => api.post('/admin/seed'),
  importProducts: (formData) => api.post('/admin/import-products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadImage: (formData) => api.post('/admin/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getChartData: () => api.get('/admin/stats/chart'),
  getRevenueReport: (params) => api.get('/admin/reports/revenue', { params }),
  exportRevenueReport: (params) => api.get('/admin/reports/revenue/export', {
    params,
    responseType: 'blob',
  }),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
};

export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  add: (data) => api.post('/wishlist', data),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};

export const marketingAPI = {
  getPromotions: () => api.get('/marketing/promotions'),
  getBanners: () => api.get('/marketing/banners'),
};

export const paymentAPI = {
  createIntent: (data) => api.post('/payments/intent', data),
};

export const reviewAPI = {
  getByProduct: (productId) => api.get(`/reviews/${productId}`),
  add: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const rewardAPI = {
  getAll: () => api.get('/rewards'),
  redeem: (rewardId) => api.post('/rewards/redeem', { rewardId }),
  getHistory: () => api.get('/rewards/history'),
  getMyVouchers: () => api.get('/rewards/my-vouchers'),
  getMembershipProfile: () => api.get('/rewards/profile'),
};

export default api;
