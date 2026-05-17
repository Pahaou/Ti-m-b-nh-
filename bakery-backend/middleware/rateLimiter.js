const rateLimit = require('express-rate-limit');

/**
 * Limiter cho Auth (Login/Register)
 * Ngăn chặn brute-force attack
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 10, // Giới hạn 10 request mỗi IP
    message: {
        success: false,
        message: 'Quá nhiều lần thử đăng nhập/đăng ký từ IP này. Vui lòng quay lại sau 15 phút.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Limiter cho API chung
 */
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 phút
    max: 1000, // 1000 request / phút
    skip: (req) => req.originalUrl.startsWith('/api/admin'),
    message: {
        success: false,
        message: 'Bạn đang gửi quá nhiều yêu cầu. Vui lòng chậm lại một chút.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Limiter cho Admin endpoints
 */
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // 1000 request / 15 phút cho admin (để upload/import thoải mái hơn)
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authLimiter,
    apiLimiter,
    adminLimiter
};
