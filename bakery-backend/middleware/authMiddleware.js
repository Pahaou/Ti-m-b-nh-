const jwt = require('jsonwebtoken');
const db = require('../config/db');
const AppError = require('../utils/AppError');
const { getJwtSecret } = require('../utils/jwtSecret');

// Middleware xác thực Token
exports.verifyToken = async (req, res, next) => {
    let token;
    
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }

    if (!token) {
        return next(new AppError('Bạn cần đăng nhập để thực hiện!', 401));
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret());
        
        // Kiểm tra user còn tồn tại trong DB không (Security check)
        const [users] = await db.execute(
            'SELECT id, role_id FROM Users WHERE id = ? AND deleted_at IS NULL',
            [decoded.id]
        );

        if (users.length === 0) {
            return next(new AppError('Người dùng không còn tồn tại hoặc đã bị khóa.', 401));
        }

        req.user = decoded; // { id, role }
        next();
    } catch (error) {
        return next(new AppError('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.', 401));
    }
};

// Middleware xác thực Admin
exports.verifyAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return next(new AppError('Quyền truy cập bị từ chối. Chỉ dành cho Quản trị viên!', 403));
    }
    next();
};

// Middleware xác thực Staff (admin hoặc staff)
exports.verifyStaff = (req, res, next) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'staff')) {
        return next(new AppError('Quyền truy cập bị từ chối. Chỉ dành cho nhân viên!', 403));
    }
    next();
};
