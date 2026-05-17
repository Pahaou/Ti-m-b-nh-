const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// 1. Lấy danh sách banner đang active
exports.getActiveBanners = asyncHandler(async (req, res) => {
    const [banners] = await db.execute(`
        SELECT * FROM Banners 
        WHERE is_active = TRUE 
        ORDER BY position ASC
    `);
    res.json({ success: true, data: banners });
});

// 2. Lấy danh sách mã khuyến mãi đang active (còn hạn và còn số lượng)
exports.getActivePromotions = asyncHandler(async (req, res) => {
    const [coupons] = await db.execute(`
        SELECT id, code, discount_type, discount_value, min_order_value,
               max_discount_amount, usage_limit, COALESCE(used_count, 0) AS used_count, valid_from, valid_until
        FROM Coupons 
        WHERE is_active = TRUE 
          AND user_id IS NULL
          AND code NOT LIKE 'REWARD-%'
          AND (usage_limit IS NULL OR COALESCE(used_count, 0) < usage_limit)
          AND (valid_from <= NOW() OR valid_from IS NULL)
          AND (valid_until >= NOW() OR valid_until IS NULL)
        ORDER BY discount_value DESC
    `);
    res.json({ success: true, data: coupons });
});
