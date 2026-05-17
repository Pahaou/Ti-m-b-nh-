const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { getJwtSecret } = require('../utils/jwtSecret');
const crypto = require('crypto');

// 1. ĐĂNG KÝ
exports.register = asyncHandler(async (req, res) => {
    const { fullname, email, password, phone } = req.body;

    if (!fullname || !email || !password) {
        throw new AppError('Vui lòng điền đầy đủ họ tên, email và mật khẩu!', 400);
    }
    if (password.length < 6) {
        throw new AppError('Mật khẩu phải có ít nhất 6 ký tự!', 400);
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/;
    if (!passwordRegex.test(password)) {
        throw new AppError('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 ký tự đặc biệt!', 400);
    }

    // Kiểm tra email tồn tại
    const [existingUser] = await db.execute('SELECT id FROM Users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
        throw new AppError('Email đã được sử dụng!', 400);
    }

    // Băm mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Lưu user (role_id = 3 = customer)
    await db.execute(
        'INSERT INTO Users (role_id, fullname, email, password, phone) VALUES (3, ?, ?, ?, ?)',
        [fullname, email, hashedPassword, phone || null]
    );

    res.status(201).json({ success: true, message: 'Đăng ký tài khoản thành công! 🎉' });
});

// 2. ĐĂNG NHẬP
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError('Vui lòng nhập email và mật khẩu!', 400);
    }

    // Tìm user + JOIN Roles để lấy role_name
    const [users] = await db.execute(`
        SELECT u.*, r.role_name 
        FROM Users u 
        JOIN Roles r ON u.role_id = r.id 
        WHERE u.email = ? AND u.deleted_at IS NULL
    `, [email]);

    if (users.length === 0) {
        throw new AppError('Email hoặc mật khẩu không đúng!', 400);
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError('Email hoặc mật khẩu không đúng!', 400);
    }

    // Tạo token
    const token = jwt.sign(
        { id: user.id, role: user.role_name },
        getJwtSecret(),
        { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
        success: true,
        message: 'Đăng nhập thành công!',
        token, // Vẫn trả về token cho các client cũ hoặc mobile app nếu cần
        user: {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            phone: user.phone,
            role: user.role_name,
            loyalty_points: user.loyalty_points,
            membership_tier: user.membership_tier
        }
    });
});

// 2.1. ĐĂNG XUẤT
exports.logout = asyncHandler(async (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.json({ success: true, message: 'Đăng xuất thành công!' });
});

// 3. XEM PROFILE
exports.getProfile = asyncHandler(async (req, res) => {
    const [users] = await db.execute(`
        SELECT u.id, u.fullname, u.email, u.phone, u.created_at, u.loyalty_points, u.total_spent, u.membership_tier, r.role_name
        FROM Users u
        JOIN Roles r ON u.role_id = r.id
        WHERE u.id = ? AND u.deleted_at IS NULL
    `, [req.user.id]);

    if (users.length === 0) {
        throw new AppError('Không tìm thấy tài khoản', 404);
    }

    // Lấy địa chỉ
    const [addresses] = await db.execute(
        'SELECT * FROM User_Addresses WHERE user_id = ?', [req.user.id]
    );

    res.json({
        success: true,
        data: { ...users[0], addresses }
    });
});

// 4. CẬP NHẬT PROFILE
exports.updateProfile = asyncHandler(async (req, res) => {
    const { fullname, phone } = req.body;

    if (!fullname || !fullname.trim()) {
        throw new AppError('Họ tên không được để trống!', 400);
    }
    if (phone && !/^(0\d{9,10})$/.test(phone)) {
        throw new AppError('Số điện thoại không hợp lệ!', 400);
    }

    await db.execute(
        'UPDATE Users SET fullname = ?, phone = ? WHERE id = ?',
        [fullname.trim(), phone || null, req.user.id]
    );
    res.json({ success: true, message: 'Cập nhật thông tin thành công!' });
});

// 5. ĐỔI MẬT KHẨU
exports.changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new AppError('Vui lòng nhập mật khẩu hiện tại và mật khẩu mới!', 400);
    }
    if (newPassword.length < 6) {
        throw new AppError('Mật khẩu mới phải có ít nhất 6 ký tự!', 400);
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/;
    if (!passwordRegex.test(newPassword)) {
        throw new AppError('Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 ký tự đặc biệt!', 400);
    }

    const [users] = await db.execute('SELECT password FROM Users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
        throw new AppError('Mật khẩu hiện tại không đúng!', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE Users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
});

// 6. QUẢN LÝ ĐỊA CHỈ
exports.addAddress = asyncHandler(async (req, res) => {
    const { receiver_name, receiver_phone, address_detail, is_default } = req.body;

    if (is_default) {
        await db.execute('UPDATE User_Addresses SET is_default = FALSE WHERE user_id = ?', [req.user.id]);
    }

    const [result] = await db.execute(
        'INSERT INTO User_Addresses (user_id, receiver_name, receiver_phone, address_detail, is_default) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, receiver_name, receiver_phone, address_detail, is_default || false]
    );

    res.status(201).json({ success: true, message: 'Thêm địa chỉ thành công!', addressId: result.insertId });
});

exports.deleteAddress = asyncHandler(async (req, res) => {
    const [result] = await db.execute(
        'DELETE FROM User_Addresses WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
        throw new AppError('Không tìm thấy địa chỉ hoặc bạn không có quyền xóa!', 404);
    }
    res.json({ success: true, message: 'Đã xóa địa chỉ' });
});

// 7. QUÊN MẬT KHẨU (Gửi mật khẩu mới)
exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new AppError('Vui lòng nhập email!', 400);

    const [users] = await db.execute('SELECT id, email, fullname FROM Users WHERE email = ? AND deleted_at IS NULL', [email]);
    if (users.length === 0) {
        return res.json({ success: true, message: 'Nếu email tồn tại, mật khẩu mới sẽ được gửi đến hòm thư của bạn.' });
    }

    const user = users[0];
    
    // Tạo mật khẩu ngẫu nhiên 8 ký tự
    const newPassword = crypto.randomBytes(4).toString('hex'); // 8 ký tự hex
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật vào DB
    await db.execute('UPDATE Users SET password = ? WHERE id = ?', [hashedPassword, user.id]);

    // Gửi email
    const { sendForgotPasswordEmail } = require('../services/mail');
    const mailResult = await sendForgotPasswordEmail({ to: user.email, newPassword });

    if (!mailResult.sent) {
        console.warn(`[ForgotPass] Không gửi được mail tới ${user.email}: ${mailResult.reason}`);
        // Log mật khẩu ra console để dev có thể xem nếu chưa cấu hình SMTP
        console.log(`\n\n=== MẬT KHẨU MỚI CHO ${user.email} ===\n${newPassword}\n=====================================\n\n`);
    }

    res.json({ success: true, message: 'Nếu email tồn tại, mật khẩu mới sẽ được gửi đến hòm thư của bạn.' });
});

// 8. ĐẶT LẠI MẬT KHẨU
exports.resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        throw new AppError('Token và mật khẩu mới không được để trống!', 400);
    }
    if (newPassword.length < 6) {
        throw new AppError('Mật khẩu mới phải có ít nhất 6 ký tự!', 400);
    }

    const hashToken = crypto.createHash('sha256').update(token).digest('hex');

    const [tokens] = await db.execute(
        'SELECT * FROM Password_Reset_Tokens WHERE token = ? AND used = FALSE AND expires_at > NOW()',
        [hashToken]
    );

    if (tokens.length === 0) {
        throw new AppError('Token không hợp lệ hoặc đã hết hạn!', 400);
    }

    const tokenRecord = tokens[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        await conn.execute('UPDATE Users SET password = ? WHERE id = ?', [hashedPassword, tokenRecord.user_id]);
        await conn.execute('UPDATE Password_Reset_Tokens SET used = TRUE WHERE id = ?', [tokenRecord.id]);

        await conn.commit();
        res.json({ success: true, message: 'Mật khẩu đã được cập nhật thành công!' });
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
});