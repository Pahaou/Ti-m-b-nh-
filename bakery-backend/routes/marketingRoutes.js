const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketingController');

// Không cần auth vì hiển thị public trên trang chủ
router.get('/banners', marketingController.getActiveBanners);
router.get('/promotions', marketingController.getActivePromotions);

module.exports = router;
