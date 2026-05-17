const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// 1. Thêm đánh giá
exports.addReview = asyncHandler(async (req, res) => {
    const { product_id, rating, comment } = req.body;

    if (!product_id || !rating || rating < 1 || rating > 5) {
        throw new AppError('Vui lòng chọn đánh giá từ 1-5 sao!', 400);
    }

    // Kiểm tra đã đánh giá chưa
    const [existing] = await db.execute(
        'SELECT id FROM Reviews WHERE user_id = ? AND product_id = ?',
        [req.user.id, product_id]
    );
    if (existing.length > 0) {
        throw new AppError('Bạn đã đánh giá sản phẩm này rồi!', 400);
    }

    const [purchased] = await db.execute(
        `SELECT oi.id FROM Order_Items oi
         INNER JOIN Orders o ON o.id = oi.order_id
         WHERE o.user_id = ? AND oi.product_id = ?
           AND o.status = 'completed'`,
        [req.user.id, product_id]
    );
    if (purchased.length === 0) {
        throw new AppError('Chỉ khách đã mua và đơn hàng đã hoàn thành mới được đánh giá sản phẩm này.', 403);
    }

    await db.execute(
        'INSERT INTO Reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
        [req.user.id, product_id, rating, comment || null]
    );

    res.status(201).json({ success: true, message: 'Cảm ơn bạn đã đánh giá! ⭐' });
});

// 2. Lấy đánh giá theo sản phẩm
exports.getProductReviews = asyncHandler(async (req, res) => {
    const [reviews] = await db.execute(`
        SELECT r.*, u.fullname 
        FROM Reviews r 
        JOIN Users u ON r.user_id = u.id 
        WHERE r.product_id = ? 
        ORDER BY r.created_at DESC
    `, [req.params.productId]);

    res.json({ success: true, data: reviews });
});
// 3. Cập nhật đánh giá (Chỉ chủ sở hữu)
exports.updateReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        throw new AppError('Vui lòng chọn đánh giá từ 1-5 sao!', 400);
    }

    // Kiểm tra quyền sở hữu
    const [review] = await db.query('SELECT id FROM Reviews WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (review.length === 0) {
        throw new AppError('Bạn không có quyền chỉnh sửa đánh giá này hoặc đánh giá không tồn tại!', 403);
    }

    await db.query(
        'UPDATE Reviews SET rating = ?, comment = ? WHERE id = ?',
        [rating, comment || null, id]
    );

    res.json({ success: true, message: 'Đã cập nhật đánh giá của bạn! ✨' });
});

// 4. Xóa đánh giá (Chỉ chủ sở hữu)
exports.deleteReview = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Kiểm tra quyền sở hữu
    const [review] = await db.query('SELECT id FROM Reviews WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (review.length === 0) {
        throw new AppError('Bạn không có quyền xóa đánh giá này hoặc đánh giá không tồn tại!', 403);
    }

    await db.query('DELETE FROM Reviews WHERE id = ?', [id]);

    res.json({ success: true, message: 'Đã xóa đánh giá của bạn.' });
});
