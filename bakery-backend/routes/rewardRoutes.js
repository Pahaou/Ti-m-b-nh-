const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', rewardController.getAllRewards);

router.use(verifyToken);

router.post('/redeem', rewardController.redeemReward);
router.get('/history', rewardController.getMyPointHistory);
router.get('/my-vouchers', rewardController.getMyVouchers);
router.get('/profile', rewardController.getMembershipProfile);

module.exports = router;
