const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const seedController = require('../controllers/seedController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { adminLimiter } = require('../middleware/rateLimiter');
const multer = require('multer');
const uploadMemory = multer({ storage: multer.memoryStorage() });
const uploadCloudinary = require('../middleware/uploadMiddleware');

// Tất cả route admin cần token + role admin + rate limit
router.use(verifyToken, verifyAdmin, adminLimiter);

// Dashboard
router.get('/stats', adminController.getDashboardStats);
router.get('/stats/chart', adminController.getRevenueChartData);
router.get('/reports/revenue', adminController.getDetailedRevenueReport);
router.get('/reports/revenue/export', adminController.exportRevenueToExcel);

// Sản phẩm
router.get('/products', adminController.getAllProducts);
router.post('/products', adminController.addProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Đơn hàng
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.post('/orders/:id/confirm-payment', adminController.confirmPayment);

// Tài khoản
router.get('/users', adminController.getAllUsers);

// Danh mục
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.addCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Khuyến mãi (Coupons)
router.get('/coupons', adminController.getAllCoupons);
router.post('/coupons', adminController.addCoupon);
router.put('/coupons/:id', adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

// Đánh giá
router.get('/reviews', adminController.getAllReviews);

// Cài đặt hệ thống
router.get('/settings', adminController.getStoreSettings);
router.put('/settings', adminController.updateStoreSettings);

// Seeding
router.post('/seed', seedController.seedKaggleData);

// Import
router.post('/import-products', uploadMemory.single('file'), adminController.importProducts);

// Upload Image
router.post('/upload-image', uploadCloudinary.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'Không có file!' });
    res.json({ success: true, url: req.file.path });
});

module.exports = router;
