const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// 1. LẤY DANH SÁCH THÔNG BÁO
exports.getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const role = req.user.role; // 'admin' or 'customer'

    let notifications;
    if (role === 'admin') {
        // ADMIN: Chỉ lấy thông báo cá nhân + Thông báo Đơn hàng mới (system alerts)
        [notifications] = await db.execute(`
            SELECT * FROM Notifications 
            WHERE user_id = ? OR (user_id IS NULL AND type IN ('system', 'order'))
            ORDER BY created_at DESC LIMIT 30
        `, [userId]);
    } else {
        // CUSTOMER: Lấy thông báo cá nhân + Khuyến mãi chung
        const [realNotifs] = await db.execute(`
            SELECT * FROM Notifications 
            WHERE user_id = ? OR (user_id IS NULL AND type = 'promo')
            ORDER BY created_at DESC LIMIT 30
        `, [userId]);

        // Lấy danh sách Khuyến mãi sắp hết hạn (trong vòng 48h)
        const [expiringCoupons] = await db.execute(`
            SELECT id, code, valid_until, discount_value, discount_type 
            FROM Coupons 
            WHERE is_active = TRUE 
            AND valid_until BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 DAY)
        `);

        // Gộp thông báo thật + thông báo ảo về Khuyến mãi
        const virtualNotifs = expiringCoupons.map(c => ({
            id: `promo-exp-${c.id}`,
            user_id: userId,
            title: '🔥 Sắp hết hạn!',
            message: `Mã giảm giá ${c.code} (${c.discount_type === 'percent' ? c.discount_value + '%' : c.discount_value.toLocaleString() + 'đ'}) sẽ hết hạn vào ${new Date(c.valid_until).toLocaleString('vi-VN')}. Dùng ngay kẻo lỡ!`,
            type: 'promo',
            is_read: 0,
            created_at: new Date()
        }));

        notifications = [...virtualNotifs, ...realNotifs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    res.json({ success: true, data: notifications });
});

// 2. ĐÁNH DẤU ĐÃ ĐỌC
exports.markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await db.execute('UPDATE Notifications SET is_read = TRUE WHERE id = ?', [id]);
    res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
});

// 3. TẠO THÔNG BÁO (Hàm tiện ích sẽ được sử dụng trong các controller khác)
exports.createNotification = async (data) => {
    const { user_id, title, message, type } = data;
    await db.execute(
        'INSERT INTO Notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [user_id || null, title, message, type || 'system']
    );
};
