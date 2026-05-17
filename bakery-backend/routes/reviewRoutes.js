const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/:productId', reviewController.getProductReviews);
router.post('/', verifyToken, reviewController.addReview);
router.put('/:id', verifyToken, reviewController.updateReview);
router.delete('/:id', verifyToken, reviewController.deleteReview);

module.exports = router;
