const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
