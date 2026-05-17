const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// 1. Lấy danh sách yêu thích
exports.getWishlist = asyncHandler(async (req, res) => {
    const [items] = await db.execute(`
        SELECT w.id, w.created_at, p.id AS product_id, p.name, p.base_price,
            pi.image_url AS thumbnail, c.name AS category_name
        FROM Wishlists w
        JOIN Products p ON p.id = w.product_id
        LEFT JOIN Product_Images pi ON pi.product_id = p.id AND pi.is_thumbnail = TRUE
        LEFT JOIN Categories c ON c.id = p.category_id
        WHERE w.user_id = ? AND p.deleted_at IS NULL
    `, [req.user.id]);

    res.json({ success: true, data: items });
});

// 2. Thêm yêu thích
exports.addToWishlist = asyncHandler(async (req, res) => {
    const { product_id } = req.body;
    if (!product_id) {
        throw new AppError('Vui lòng chọn sản phẩm', 400);
    }

    const [products] = await db.execute(
        'SELECT id FROM Products WHERE id = ? AND deleted_at IS NULL',
        [product_id]
    );
    if (products.length === 0) {
        throw new AppError('Sản phẩm không tồn tại hoặc đã ngừng bán', 404);
    }

    await db.execute(
        'INSERT IGNORE INTO Wishlists (user_id, product_id) VALUES (?, ?)',
        [req.user.id, product_id]
    );
    res.json({ success: true, message: 'Đã thêm vào yêu thích ❤️' });
});

// 3. Xóa yêu thích
exports.removeFromWishlist = asyncHandler(async (req, res) => {
    await db.execute(
        'DELETE FROM Wishlists WHERE product_id = ? AND user_id = ?',
        [req.params.productId, req.user.id]
    );
    res.json({ success: true, message: 'Đã bỏ yêu thích' });
});
