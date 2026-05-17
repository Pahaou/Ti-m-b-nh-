const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken); // Tất cả route cần đăng nhập

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.delete('/clear', cartController.clearCart);
router.put('/:id', cartController.updateCartItem);
router.delete('/:id', cartController.removeCartItem);

module.exports = router;
