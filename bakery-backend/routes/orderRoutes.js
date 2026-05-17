const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');

const validate = require('../middleware/validateMiddleware');
const schemas = require('../utils/validations');

router.use(verifyToken);

router.post('/', validate(schemas.createOrder), orderController.createOrder);
router.get('/', orderController.getMyOrders);
router.post('/validate-coupon', orderController.validateCoupon);
router.put('/:id/cancel', orderController.cancelOrder);
router.post('/:id/repay', orderController.repay);
router.get('/:id', orderController.getOrderDetail);

module.exports = router;
