const db = require('../config/db');
const AppError = require('../utils/AppError');

/**
 * Validate and apply a coupon to an order amount.
 * @param {object} conn - Database connection (for transactions)
 * @param {string} code - Coupon code
 * @param {number} userId - ID of the user
 * @param {number} totalAmount - Total order amount before discount
 * @returns {object} { couponId, discountAmount }
 */
function calculateDiscount(coupon, totalAmount) {
    const orderTotal = Number(totalAmount) || 0;
    let discountAmount = 0;

    if (coupon.discount_type === 'percent') {
        discountAmount = (orderTotal * Number(coupon.discount_value)) / 100;
        if (coupon.max_discount_amount && discountAmount > Number(coupon.max_discount_amount)) {
            discountAmount = Number(coupon.max_discount_amount);
        }
    } else {
        discountAmount = Number(coupon.discount_value);
    }

    return Math.max(0, Math.min(discountAmount, orderTotal));
}

async function validateAndApplyCoupon(conn, code, userId, totalAmount) {
    const normalizedCode = String(code || '').trim().toUpperCase();
    if (!normalizedCode) return { couponId: null, discountAmount: 0 };

    const [coupons] = await conn.execute(`
        SELECT * FROM Coupons 
        WHERE code = ? AND is_active = TRUE 
        AND (user_id IS NULL OR user_id = ?)
        AND (code NOT LIKE 'REWARD-%' OR user_id = ?)
        AND (valid_from IS NULL OR valid_from <= NOW()) 
        AND (valid_until IS NULL OR valid_until >= NOW())
        AND (usage_limit IS NULL OR COALESCE(used_count, 0) < usage_limit)
        FOR UPDATE
    `, [normalizedCode, userId, userId]);

    if (coupons.length === 0) {
        throw new AppError('Mã giảm giá không hợp lệ hoặc đã hết hạn!', 400);
    }

    const coupon = coupons[0];

    // Check if user has used this coupon
    const [usage] = await conn.execute(
        'SELECT COUNT(*) as count FROM Orders WHERE user_id = ? AND coupon_id = ? AND status <> ?',
        [userId, coupon.id, 'cancelled']
    );

    if (usage[0].count > 0) {
        throw new AppError('Bạn đã sử dụng mã giảm giá này rồi!', 400);
    }

    if (totalAmount < Number(coupon.min_order_value)) {
        throw new AppError(`Đơn hàng tối thiểu ${Number(coupon.min_order_value).toLocaleString()}đ để sử dụng mã này`, 400);
    }

    const discountAmount = calculateDiscount(coupon, totalAmount);

    // Increment used count
    await conn.execute('UPDATE Coupons SET used_count = COALESCE(used_count, 0) + 1 WHERE id = ?', [coupon.id]);

    return { couponId: coupon.id, discountAmount };
}

module.exports = { validateAndApplyCoupon, calculateDiscount };
