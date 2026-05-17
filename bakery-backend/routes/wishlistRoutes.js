const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', wishlistController.getWishlist);
router.post('/', wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);

module.exports = router;
