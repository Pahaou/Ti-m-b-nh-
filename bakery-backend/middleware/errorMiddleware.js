const AppError = require('../utils/AppError');

/**
 * Middleware xử lý lỗi toàn cục
 * Đặt SAU tất cả routes trong server.js
 */

// Xử lý route không tồn tại
const notFound = (req, res, next) => {
    next(new AppError(`Không tìm thấy API: ${req.originalUrl}`, 404));
};

// Xử lý tất cả lỗi
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Lỗi hệ thống';

    // MySQL duplicate entry
    if (err.code === 'ER_DUP_ENTRY') {
        statusCode = 400;
        message = 'Dữ liệu đã tồn tại trong hệ thống';
    }

    // MySQL foreign key constraint
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        statusCode = 400;
        message = 'Dữ liệu tham chiếu không hợp lệ';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Token không hợp lệ';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Phiên đăng nhập đã hết hạn';
    }

    // Log lỗi (chỉ khi 500)
    if (statusCode === 500) {
        console.error('❌ Server Error:', err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(err.errorCode && { code: err.errorCode }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = { notFound, errorHandler };
