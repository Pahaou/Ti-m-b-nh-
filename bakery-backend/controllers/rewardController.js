const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// 1. Lấy danh sách quà tặng khả dụng
exports.getAllRewards = asyncHandler(async (req, res) => {
    const [rewards] = await db.execute('SELECT * FROM Rewards WHERE is_active = TRUE');
    res.json({ success: true, data: rewards });
});

// 2. Đổi quà (Trừ điểm & Tạo bản ghi redemption)
exports.redeemReward = asyncHandler(async (req, res) => {
    const { rewardId } = req.body;
    const userId = req.user.id;

    if (!rewardId) {
        throw new AppError('Vui lòng chọn quà tặng!', 400);
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Kiểm tra quà tặng tồn tại và điểm yêu cầu
        const [rewards] = await conn.execute(
            'SELECT * FROM Rewards WHERE id = ? AND is_active = TRUE FOR UPDATE', 
            [rewardId]
        );
        if (rewards.length === 0) {
            throw new AppError('Quà tặng không tồn tại hoặc đã bị ẩn.', 404);
        }
        const reward = rewards[0];

        // 2. Kiểm tra điểm của user
        const [users] = await conn.execute(
            'SELECT loyalty_points FROM Users WHERE id = ? FOR UPDATE',
            [userId]
        );
        const userPoints = users[0].loyalty_points;

        if (userPoints < reward.points_required) {
            throw new AppError(`Bạn không đủ điểm (Cần ${reward.points_required}, hiện có ${userPoints})`, 400);
        }

        // 3. Trừ điểm user
        await conn.execute(
            'UPDATE Users SET loyalty_points = loyalty_points - ? WHERE id = ?',
            [reward.points_required, userId]
        );

        // 5. Tạo bản ghi đổi quà (Reward_Redemptions)
        const [result] = await conn.execute(
            'INSERT INTO Reward_Redemptions (user_id, reward_id, points_used, status) VALUES (?, ?, ?, ?)',
            [userId, rewardId, reward.points_required, 'completed']
        );

        // 6. Nếu là voucher, tạo mã coupon cho user
        let generatedCoupon = null;
        if (reward.reward_type === 'coupon') {
            const crypto = require('crypto');
            const code = `REWARD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
            
            // Voucher hết hạn sau 30 ngày
            const validUntil = new Date();
            validUntil.setDate(validUntil.getDate() + 30);
            
            // Link coupon to user_id — dùng số 1 thay vì boolean true để tránh lỗi MySQL
            await conn.execute(
                `INSERT INTO Coupons (code, discount_type, discount_value, min_order_value, usage_limit, used_count, is_active, user_id, valid_until) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [code, 'fixed', reward.reward_value, 0, 1, 0, 1, userId, validUntil]
            );
            generatedCoupon = code;
        }

        // 7. Lưu lịch sử điểm (Point_History) - Lưu mã voucher vào reason nếu có
        const historyReason = generatedCoupon ? `Đổi quà: ${reward.name} (Mã: ${generatedCoupon})` : `Đổi quà: ${reward.name}`;
        await conn.execute(
            'INSERT INTO Point_History (user_id, points, reason) VALUES (?, ?, ?)',
            [userId, -reward.points_required, historyReason]
        );

        // 8. Tạo thông báo cho người dùng
        const notifMessage = generatedCoupon 
            ? `Bạn đã đổi thành công "${reward.name}"! Mã voucher của bạn: ${generatedCoupon}. Hãy sử dụng khi thanh toán nhé!`
            : `Bạn đã đổi thành công "${reward.name}"! Vui lòng liên hệ cửa hàng để nhận quà.`;
        await conn.execute(
            'INSERT INTO Notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
            [userId, '🎁 Đổi quà thành công!', notifMessage, 'promo']
        );

        await conn.commit();

        res.json({
            success: true,
            message: `Đổi quà "${reward.name}" thành công!`,
            data: {
                pointsRemaining: userPoints - reward.points_required,
                couponCode: generatedCoupon
            }
        });
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
});

// 3. Lấy lịch sử tích điểm của tôi
exports.getMyPointHistory = asyncHandler(async (req, res) => {
    const [history] = await db.execute(
        'SELECT * FROM Point_History WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id]
    );
    res.json({ success: true, data: history });
});

// 4. Lấy danh sách voucher của tôi
exports.getMyVouchers = asyncHandler(async (req, res) => {
    const [vouchers] = await db.execute(
        `SELECT * FROM Coupons
         WHERE user_id = ?
           AND is_active = TRUE
           AND (usage_limit IS NULL OR COALESCE(used_count, 0) < usage_limit)
           AND (valid_from IS NULL OR valid_from <= NOW())
           AND (valid_until IS NULL OR valid_until >= NOW())
         ORDER BY id DESC`,
        [req.user.id]
    );
    res.json({ success: true, data: vouchers });
});

// 5. Tổng hợp thông tin hội viên (Points + History + Vouchers)
exports.getMembershipProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Lấy thông tin user
    const [users] = await db.execute('SELECT loyalty_points, membership_tier FROM Users WHERE id = ?', [userId]);
    const user = users[0];

    // Lấy lịch sử
    const [history] = await db.execute('SELECT * FROM Point_History WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [userId]);

    // Lấy vouchers
    const [vouchers] = await db.execute(`
        SELECT * FROM Coupons
        WHERE user_id = ?
          AND is_active = TRUE
          AND (usage_limit IS NULL OR COALESCE(used_count, 0) < usage_limit)
          AND (valid_from IS NULL OR valid_from <= NOW())
          AND (valid_until IS NULL OR valid_until >= NOW())
        ORDER BY id DESC
    `, [userId]);

    res.json({
        success: true,
        data: {
            points: user?.loyalty_points || 0,
            tier: user?.membership_tier || 'bronze',
            history: history.map(h => ({
                id: h.id,
                type: h.points > 0 ? 'earn' : 'redeem',
                points: h.points,
                date: h.created_at,
                reason: h.reason
            })),
            vouchers: vouchers
        }
    });
});
