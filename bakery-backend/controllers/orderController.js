const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { restoreStockForOrder } = require('../utils/orderStock');

// 1. TẠO ĐƠN HÀNG (từ giỏ hàng → MySQL Transaction)
exports.createOrder = asyncHandler(async (req, res) => {
    const { shipping_address, customer_note, payment_method, coupon_code } = req.body;

    if (!shipping_address) {
        throw new AppError('Vui lòng nhập địa chỉ giao hàng!', 400);
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Lấy giỏ hàng & Lock để kiểm tra stock
        const [cartItems] = await conn.execute(`
            SELECT ci.*, p.name, p.base_price, pv.price_adjustment, pv.stock_quantity, pv.size_name
            FROM Carts c
            JOIN Cart_Items ci ON ci.cart_id = c.id
            JOIN Products p ON p.id = ci.product_id AND p.deleted_at IS NULL
            JOIN Product_Variants pv ON pv.id = ci.variant_id AND pv.product_id = p.id
            WHERE c.user_id = ?
            FOR UPDATE
        `, [req.user.id]);

        if (cartItems.length === 0) {
            throw new AppError('Giỏ hàng đang trống!', 400);
        }

        // 2. Tính toán tổng tiền & Kiểm tra stock
        let totalAmount = 0;
        for (const item of cartItems) {
            if (item.quantity > item.stock_quantity) {
                throw new AppError(`"${item.name} - ${item.size_name}" không đủ hàng trong kho (Còn: ${item.stock_quantity})`, 400);
            }
            const unitPrice = Number(item.base_price) + Number(item.price_adjustment);
            totalAmount += unitPrice * item.quantity;
        }

        // 3. Xử lý Coupon & Phí ship
        const { validateAndApplyCoupon } = require('../services/couponService');
        const { couponId, discountAmount } = await validateAndApplyCoupon(conn, coupon_code, req.user.id, totalAmount);
        
        const shippingFee = totalAmount >= 500000 ? 0 : 30000;
        const finalAmount = totalAmount + shippingFee - discountAmount;

        // 4. Lưu Đơn hàng
        const [orderResult] = await conn.execute(`
            INSERT INTO Orders (user_id, coupon_id, total_amount, shipping_fee, discount_amount, final_amount, shipping_address, customer_note, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `, [req.user.id, couponId, totalAmount, shippingFee, discountAmount, finalAmount, shipping_address, customer_note || null]);

        const orderId = orderResult.insertId;

        // 5. Lưu Chi tiết & Trừ Stock
        for (const item of cartItems) {
            const unitPrice = Number(item.base_price) + Number(item.price_adjustment);
            await conn.execute(
                'INSERT INTO Order_Items (order_id, product_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.product_id, item.variant_id, item.quantity, unitPrice]
            );
            await conn.execute(
                'UPDATE Product_Variants SET stock_quantity = stock_quantity - ? WHERE id = ?',
                [item.quantity, item.variant_id]
            );
        }

        // 6. Xử lý Thanh toán
        await conn.execute(
            'INSERT INTO Payments (order_id, payment_method, payment_status) VALUES (?, ?, ?)',
            [orderId, payment_method || 'COD', 'unpaid']
        );

        // 7. Xóa giỏ hàng
        await conn.execute('DELETE ci FROM Cart_Items ci JOIN Carts c ON ci.cart_id = c.id WHERE c.user_id = ?', [req.user.id]);

        await conn.commit();

        // 8. Hậu xử lý (Email & Thông báo) - Không chặn transaction
        // Use exports to avoid 'this' context issues
        exports.afterOrderCreated(req.user.id, orderId, finalAmount);

        res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công! 🎉',
            data: { orderId, finalAmount, shippingFee, discountAmount }
        });
    } catch (error) {
        if (conn) await conn.rollback();
        console.error('âŒ [OrderController] createOrder error:', error);
        throw error;
    } finally {
        if (conn) conn.release();
    }
});

// Helper xử lý sau khi tạo đơn (Async)
exports.afterOrderCreated = async (userId, orderId, finalAmount) => {
    try {
        const [userRows] = await db.execute('SELECT fullname, email, loyalty_points FROM Users WHERE id = ?', [userId]);
        const user = userRows[0];
        
        // Doanh số và điểm thưởng chỉ cộng khi thanh toán hợp lệ hoặc đơn COD hoàn thành.

        // 2. Gửi email
        const { sendOrderPlacedEmail } = require('../services/mail');
        if (user?.email) {
            void sendOrderPlacedEmail({ to: user.email, orderId, amount: finalAmount });
        }

        // 3. Thông báo Admin
        const notificationController = require('./notificationController');
        await notificationController.createNotification({
            user_id: null,
            title: '🔔 Đơn hàng mới!',
            message: `Khách hàng ${user?.fullname || 'Khách'} vừa đặt đơn hàng #${orderId} trị giá ${finalAmount.toLocaleString()}đ.`,
            type: 'order'
        });

        // 4. Thông báo cho Người dùng (Chỉ cho COD/TRANSFER ngay lập tức)
        const [payRows] = await db.execute('SELECT payment_method FROM Payments WHERE order_id = ?', [orderId]);
        const pm = payRows[0]?.payment_method;

        if (pm === 'COD' || pm === 'TRANSFER') {
            await notificationController.createNotification({
                user_id: userId,
                title: '📝 Đơn hàng đã được ghi nhận',
                message: `Đơn hàng #${orderId} của bạn đã được hệ thống tiếp nhận. Vui lòng hoàn tất thanh toán (nếu có) để chúng tôi bắt đầu thực hiện nhé!`,
                type: 'order'
            });
        }

    } catch (err) {
        console.error('Lỗi sau khi tạo đơn hàng:', err.message);
    }
};

// 2. XEM ĐƠN HÀNG CỦA TÔI
exports.getMyOrders = asyncHandler(async (req, res) => {
    const [orders] = await db.execute(`
        SELECT o.*, 
            p.payment_method, p.payment_status,
            COUNT(oi.id) AS item_count
        FROM Orders o
        LEFT JOIN Payments p ON p.order_id = o.id
        LEFT JOIN Order_Items oi ON oi.order_id = o.id
        WHERE o.user_id = ?
        GROUP BY o.id, p.payment_method, p.payment_status
        ORDER BY o.order_date DESC
    `, [req.user.id]);

    res.json({ success: true, data: orders });
});

// 3. CHI TIẾT ĐƠN HÀNG
exports.getOrderDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const [orders] = await db.execute(`
        SELECT o.*, p.payment_method, p.payment_status
        FROM Orders o
        LEFT JOIN Payments p ON p.order_id = o.id
        WHERE o.id = ? AND o.user_id = ?
    `, [id, req.user.id]);

    if (orders.length === 0) {
        throw new AppError('Không tìm thấy đơn hàng', 404);
    }

    const [items] = await db.execute(`
        SELECT oi.*, p.name AS product_name, pv.size_name, pi.image_url AS thumbnail
        FROM Order_Items oi
        JOIN Products p ON p.id = oi.product_id
        LEFT JOIN Product_Variants pv ON pv.id = oi.variant_id
        LEFT JOIN Product_Images pi ON pi.product_id = p.id AND pi.is_thumbnail = TRUE
        WHERE oi.order_id = ?
    `, [id]);

    res.json({ success: true, data: { ...orders[0], items } });
});

// 4. HỦY ĐƠN HÀNG (chỉ khi pending)
exports.cancelOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const [orders] = await db.execute(
        'SELECT * FROM Orders WHERE id = ? AND user_id = ?', [id, req.user.id]
    );

    if (orders.length === 0) throw new AppError('Không tìm thấy đơn hàng', 404);
    const st = orders[0].status;
    if (st !== 'pending' && st !== 'confirmed') {
        throw new AppError('Chỉ có thể hủy khi đơn chưa vào làm bánh (chờ xác nhận hoặc đã xác nhận).', 400);
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        await restoreStockForOrder(conn, id);

        // Hoàn coupon (nếu có)
        if (orders[0].coupon_id) {
            await conn.execute('UPDATE Coupons SET used_count = GREATEST(COALESCE(used_count, 0) - 1, 0) WHERE id = ?', [orders[0].coupon_id]);
        }

        await conn.execute("UPDATE Orders SET status = 'cancelled' WHERE id = ?", [id]);
        await conn.commit();

        res.json({ success: true, message: 'Đã hủy đơn hàng' });
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
});

// 5. VALIDATE COUPON
exports.validateCoupon = asyncHandler(async (req, res) => {
    const { code, order_total } = req.body;
    const normalizedCode = String(code || '').trim().toUpperCase();
    const orderTotal = Number(order_total) || 0;

    if (!normalizedCode) {
        throw new AppError('Vui lòng nhập mã giảm giá.', 400);
    }

    const [coupons] = await db.execute(`
        SELECT * FROM Coupons 
        WHERE code = ? AND is_active = TRUE 
        AND (user_id IS NULL OR user_id = ?)
        AND (code NOT LIKE 'REWARD-%' OR user_id = ?)
        AND (valid_from IS NULL OR valid_from <= NOW()) 
        AND (valid_until IS NULL OR valid_until >= NOW())
        AND (usage_limit IS NULL OR COALESCE(used_count, 0) < usage_limit)
    `, [normalizedCode, req.user.id, req.user.id]);

    if (coupons.length === 0) {
        throw new AppError('Mã giảm giá không hợp lệ hoặc đã hết hạn!', 400);
    }

    const coupon = coupons[0];

    // Kiểm tra user đã dùng chưa
    const [usage] = await db.execute(
        'SELECT COUNT(*) as count FROM Orders WHERE user_id = ? AND coupon_id = ? AND status <> ?',
        [req.user.id, coupon.id, 'cancelled']
    );
    if (usage[0].count > 0) {
        throw new AppError('Bạn đã sử dụng mã giảm giá này rồi!', 400);
    }

    if (orderTotal < Number(coupon.min_order_value)) {
        throw new AppError(`Đơn hàng tối thiểu ${Number(coupon.min_order_value).toLocaleString()}đ để sử dụng mã này`, 400);
    }

    const { calculateDiscount } = require('../services/couponService');
    const discount = calculateDiscount(coupon, orderTotal);

    res.json({
        success: true,
        data: {
            code: coupon.code,
            discount_type: coupon.discount_type,
            discount_value: Number(coupon.discount_value),
            min_order_value: Number(coupon.min_order_value || 0),
            max_discount_amount: coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null,
            discount_amount: discount
        }
    });
});

// 6. THANH TOÁN LẠI (cho đơn chưa trả tiền)
exports.repay = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const [orders] = await db.execute(`
        SELECT o.*, p.payment_method, p.payment_status
        FROM Orders o
        JOIN Payments p ON p.order_id = o.id
        WHERE o.id = ? AND o.user_id = ?
    `, [id, req.user.id]);

    if (orders.length === 0) throw new AppError('Không tìm thấy đơn hàng', 404);
    const order = orders[0];

    if (order.payment_status === 'paid') {
        throw new AppError('Đơn hàng này đã được thanh toán.', 400);
    }

    if (order.status === 'cancelled') {
        throw new AppError('Đơn hàng đã bị hủy, không thể thanh toán.', 400);
    }

    let paymentData = null;

    if (order.payment_method === 'MOMO') {
        const momoProvider = require('../services/payment/momoProvider');
        paymentData = await momoProvider.buildMoMoRequest({
            orderId: order.id,
            amount: order.final_amount,
            orderInfo: `Thanh toan lai don hang #${order.id}`
        });
    } else if (order.payment_method === 'VNPAY') {
        const vnpayProvider = require('../services/payment/vnpayProvider');
        paymentData = await vnpayProvider.buildVNPayRequest({
            orderId: order.id,
            amount: order.final_amount,
            ipAddr: req.ip || '127.0.0.1'
        });
    }

    res.json({
        success: true,
        data: {
            payment_method: order.payment_method,
            paymentData
        }
    });
});
