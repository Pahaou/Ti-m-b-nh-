const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

router.post('/intent', verifyToken, paymentController.createIntent);
router.post('/momo/ipn', paymentController.momoIpn);
router.get('/vnpay/return', paymentController.vnpayReturn);
router.get('/vnpay-mock', paymentController.vnpayMock);

module.exports = router;
