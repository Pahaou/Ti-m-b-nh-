const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// 1. Lấy giỏ hàng
exports.getCart = asyncHandler(async (req, res) => {
    const [items] = await db.execute(`
        SELECT 
            ci.id AS cart_item_id, ci.quantity,
            p.id AS product_id, p.name, p.base_price,
            pv.id AS variant_id, pv.size_name, pv.price_adjustment, pv.stock_quantity,
            pi.image_url AS thumbnail
        FROM Carts c
        JOIN Cart_Items ci ON ci.cart_id = c.id
        JOIN Products p ON p.id = ci.product_id AND p.deleted_at IS NULL
        JOIN Product_Variants pv ON pv.id = ci.variant_id AND pv.product_id = p.id
        LEFT JOIN Product_Images pi ON pi.product_id = p.id AND pi.is_thumbnail = TRUE
        WHERE c.user_id = ?
    `, [req.user.id]);

    const total = items.reduce((sum, item) => {
        return sum + (Number(item.base_price) + Number(item.price_adjustment)) * item.quantity;
    }, 0);

    res.json({ success: true, data: { items, total } });
});

// 2. Thêm vào giỏ
exports.addToCart = asyncHandler(async (req, res) => {
    const { product_id, variant_id, quantity: rawQty = 1 } = req.body;
    const quantity = Math.max(1, parseInt(String(rawQty), 10) || 1);

    if (!product_id || !variant_id) {
        throw new AppError('Vui lòng chọn sản phẩm và size!', 400);
    }

    const [variants] = await db.execute(`
        SELECT pv.stock_quantity
        FROM Product_Variants pv
        JOIN Products p ON p.id = pv.product_id AND p.deleted_at IS NULL
        WHERE pv.id = ? AND pv.product_id = ?
    `, [variant_id, product_id]);
    if (variants.length === 0) throw new AppError('Size không tồn tại', 404);
    const stock = Number(variants[0].stock_quantity);
    if (stock < 1) throw new AppError('Sản phẩm đã hết hàng!', 400);

    // Tạo Cart nếu chưa có
    await db.execute(
        'INSERT IGNORE INTO Carts (user_id) VALUES (?)', [req.user.id]
    );
    const [carts] = await db.execute('SELECT id FROM Carts WHERE user_id = ?', [req.user.id]);
    const cartId = carts[0].id;

    // Kiểm tra đã có trong giỏ chưa
    const [existing] = await db.execute(
        'SELECT id, quantity FROM Cart_Items WHERE cart_id = ? AND product_id = ? AND variant_id = ?',
        [cartId, product_id, variant_id]
    );

    if (existing.length > 0) {
        const newQty = Number(existing[0].quantity) + quantity;
        if (newQty > stock) {
            throw new AppError(`Trong kho chỉ còn ${stock} sản phẩm. Giỏ của bạn đã có ${existing[0].quantity} chiếc.`, 400);
        }
        await db.execute(
            'UPDATE Cart_Items SET quantity = quantity + ? WHERE id = ?',
            [quantity, existing[0].id]
        );
    } else {
        if (quantity > stock) {
            throw new AppError(`Chỉ còn ${stock} sản phẩm trong kho.`, 400);
        }
        await db.execute(
            'INSERT INTO Cart_Items (cart_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)',
            [cartId, product_id, variant_id, quantity]
        );
    }

    res.json({ success: true, message: 'Đã thêm vào giỏ hàng! 🛒' });
});

// 3. Cập nhật số lượng
exports.updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const { id } = req.params;

    const [items] = await db.execute(`
        SELECT ci.id, pv.stock_quantity FROM Cart_Items ci
        JOIN Carts c ON c.id = ci.cart_id
        JOIN Product_Variants pv ON pv.id = ci.variant_id
        JOIN Products p ON p.id = ci.product_id AND p.deleted_at IS NULL AND pv.product_id = p.id
        WHERE ci.id = ? AND c.user_id = ?
    `, [id, req.user.id]);

    if (items.length === 0) throw new AppError('Không tìm thấy sản phẩm trong giỏ', 404);

    if (Number(quantity) < 1) {
        await db.execute(`
            DELETE ci FROM Cart_Items ci
            JOIN Carts c ON c.id = ci.cart_id
            WHERE ci.id = ? AND c.user_id = ?
        `, [id, req.user.id]);
        return res.json({ success: true, message: 'Đã xóa khỏi giỏ hàng' });
    }

    if (quantity > items[0].stock_quantity) throw new AppError('Vượt quá số lượng tồn kho!', 400);

    await db.execute('UPDATE Cart_Items SET quantity = ? WHERE id = ?', [quantity, id]);
    res.json({ success: true, message: 'Đã cập nhật số lượng' });
});

// 4. Xóa khỏi giỏ
exports.removeCartItem = asyncHandler(async (req, res) => {
    await db.execute(`
        DELETE ci FROM Cart_Items ci 
        JOIN Carts c ON c.id = ci.cart_id 
        WHERE ci.id = ? AND c.user_id = ?
    `, [req.params.id, req.user.id]);

    res.json({ success: true, message: 'Đã xóa khỏi giỏ hàng' });
});

// 5. Xóa toàn bộ giỏ
exports.clearCart = asyncHandler(async (req, res) => {
    await db.execute(`
        DELETE ci FROM Cart_Items ci 
        JOIN Carts c ON c.id = ci.cart_id 
        WHERE c.user_id = ?
    `, [req.user.id]);

    res.json({ success: true, message: 'Đã xóa toàn bộ giỏ hàng' });
});
