const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const schemas = require('../utils/validations');
const { authLimiter } = require('../middleware/rateLimiter');

// Public
router.post('/register', authLimiter, validate(schemas.register), userController.register);
router.post('/login', authLimiter, validate(schemas.login), userController.login);
router.post('/logout', userController.logout);
router.post('/forgot-password', authLimiter, userController.forgotPassword);
router.post('/reset-password', authLimiter, userController.resetPassword);

// Protected (cần đăng nhập)
router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.updateProfile);
router.put('/change-password', verifyToken, userController.changePassword);
router.post('/addresses', verifyToken, userController.addAddress);
router.delete('/addresses/:id', verifyToken, userController.deleteAddress);

module.exports = router;