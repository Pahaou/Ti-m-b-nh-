const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const xlsx = require('xlsx');
const { assertTransition } = require('../utils/orderStatusFsm');
const { restoreStockForOrder } = require('../utils/orderStock');
const { assertPaidBeforeStatus, requiresPrepaid } = require('../utils/orderPaymentRules');

function toNum(v) {
    if (v == null) return 0;
    return typeof v === 'bigint' ? Number(v) : Number(v);
}

function serializeReportRows(rows) {
    return rows.map((row) => {
        const out = {};
        for (const [k, v] of Object.entries(row)) {
            out[k] = typeof v === 'bigint' ? Number(v) : v;
        }
        return out;
    });
}

/** Khoảng thời gian cho báo cáo doanh thu (đơn completed) */
function buildRevenueDateFilter(query = {}) {
    const { startDate, endDate } = query;
    let clause = "WHERE o.status = 'completed'";
    const params = [];
    if (startDate) {
        clause += ' AND DATE(o.order_date) >= ?';
        params.push(startDate);
    }
    if (endDate) {
        clause += ' AND DATE(o.order_date) <= ?';
        params.push(endDate);
    }
    return { clause, params };
}

function resolveRevenueGroupBy(groupBy) {
    // periodSelect và periodGroupBy phải khớp để tương thích sql_mode=ONLY_FULL_GROUP_BY
    if (groupBy === 'month') {
        return {
            periodSelect: "DATE_FORMAT(o.order_date, '%m/%Y')",
            periodGroupBy: "DATE_FORMAT(o.order_date, '%Y-%m')",
        };
    }
    if (groupBy === 'year') {
        return {
            periodSelect: 'CAST(YEAR(o.order_date) AS CHAR)',
            periodGroupBy: 'YEAR(o.order_date)',
        };
    }
    return {
        periodSelect: "DATE_FORMAT(o.order_date, '%d/%m/%Y')",
        periodGroupBy: "DATE_FORMAT(o.order_date, '%d/%m/%Y')",
    };
}

// ========== DASHBOARD ==========
exports.getDashboardStats = asyncHandler(async (req, res) => {
    // Doanh thu thực tế (đã hoàn thành)
    const [[{ totalRevenue }]] = await db.execute(
        "SELECT COALESCE(SUM(final_amount), 0) AS totalRevenue FROM Orders WHERE status = 'completed'"
    );
    
    // Doanh thu tiềm năng (tất cả trừ đơn đã hủy)
    const [[{ potentialRevenue }]] = await db.execute(
        "SELECT COALESCE(SUM(final_amount), 0) AS potentialRevenue FROM Orders WHERE status != 'cancelled'"
    );

    const [[{ totalOrders }]] = await db.execute('SELECT COUNT(*) AS totalOrders FROM Orders');
    const [[{ pendingOrders }]] = await db.execute(
        "SELECT COUNT(*) AS pendingOrders FROM Orders WHERE status = 'pending'"
    );
    const [[{ totalProducts }]] = await db.execute(
        'SELECT COUNT(*) AS totalProducts FROM Products WHERE deleted_at IS NULL'
    );
    const [[{ totalCustomers }]] = await db.execute(
        "SELECT COUNT(*) AS totalCustomers FROM Users WHERE role_id = 3 AND deleted_at IS NULL"
    );

    // Đơn hàng gần đây
    const [recentOrders] = await db.execute(`
        SELECT o.id, o.final_amount, o.status, o.order_date, u.fullname
        FROM Orders o JOIN Users u ON u.id = o.user_id
        ORDER BY o.order_date DESC LIMIT 5
    `);

    res.json({
        success: true,
        data: { 
            totalRevenue, 
            potentialRevenue,
            totalOrders, 
            pendingOrders, 
            totalProducts, 
            totalCustomers, 
            recentOrders 
        }
    });
});

exports.getRevenueChartData = asyncHandler(async (req, res) => {
    // Lấy doanh thu 7 ngày gần nhất
    const [chartData] = await db.execute(`
        SELECT 
            DATE_FORMAT(order_date, '%d/%m') AS date,
            SUM(final_amount) AS revenue
        FROM Orders
        WHERE status = 'completed' 
        AND order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE_FORMAT(order_date, '%d/%m')
        ORDER BY MIN(order_date) ASC
    `);
    res.json({ success: true, data: chartData });
});

// Báo cáo doanh thu chi tiết (Tùy chọn khoảng thời gian)
exports.getDetailedRevenueReport = asyncHandler(async (req, res) => {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const { periodSelect, periodGroupBy } = resolveRevenueGroupBy(groupBy);
    const { clause, params } = buildRevenueDateFilter({ startDate, endDate });

    const [revenueData] = await db.execute(`
        SELECT 
            ${periodSelect} AS period,
            SUM(o.final_amount) AS total_revenue,
            COUNT(o.id) AS order_count,
            AVG(o.final_amount) AS average_order_value
        FROM Orders o
        ${clause}
        GROUP BY ${periodGroupBy}
        ORDER BY MIN(o.order_date) ASC
    `, params);

    const [categoryData] = await db.execute(`
        SELECT 
            c.name AS category_name,
            c.is_defect AS is_defect,
            SUM(oi.unit_price * oi.quantity) AS revenue,
            SUM(oi.quantity) AS units_sold
        FROM Order_Items oi
        JOIN Products p ON p.id = oi.product_id
        JOIN Categories c ON c.id = p.category_id
        JOIN Orders o ON o.id = oi.order_id
        ${clause}
        GROUP BY c.id, c.name, c.is_defect
        ORDER BY revenue DESC
    `, params);

    const [[totals]] = await db.execute(`
        SELECT 
            COALESCE(SUM(o.final_amount), 0) AS grand_total,
            COUNT(o.id) AS total_orders
        FROM Orders o
        ${clause}
    `, params);

    const [[defectTotals]] = await db.execute(`
        SELECT COALESCE(SUM(oi.unit_price * oi.quantity), 0) AS defect_revenue
        FROM Order_Items oi
        JOIN Products p ON p.id = oi.product_id
        JOIN Categories c ON c.id = p.category_id AND c.is_defect = TRUE
        JOIN Orders o ON o.id = oi.order_id
        ${clause}
    `, params);

    res.json({
        success: true,
        data: {
            summary: serializeReportRows(revenueData),
            byCategory: serializeReportRows(categoryData),
            totals: {
                grand_total: toNum(totals?.grand_total),
                total_orders: toNum(totals?.total_orders),
                defect_revenue: toNum(defectTotals?.defect_revenue),
            },
            filters: { startDate: startDate || null, endDate: endDate || null, groupBy },
        },
    });
});

// Xuất báo cáo doanh thu ra Excel
exports.exportRevenueToExcel = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const { clause, params } = buildRevenueDateFilter({ startDate, endDate });

    const [orderRows] = await db.execute(`
        SELECT 
            o.id AS 'Mã đơn',
            o.order_date AS 'Ngày đặt',
            u.fullname AS 'Khách hàng',
            o.total_amount AS 'Tổng tiền hàng',
            o.shipping_fee AS 'Phí ship',
            o.discount_amount AS 'Giảm giá',
            o.final_amount AS 'Doanh thu thực',
            o.status AS 'Trạng thái',
            p.payment_method AS 'Thanh toán'
        FROM Orders o
        JOIN Users u ON u.id = o.user_id
        LEFT JOIN Payments p ON p.order_id = o.id
        ${clause}
        ORDER BY o.order_date DESC
    `, params);

    const [categoryRows] = await db.execute(`
        SELECT 
            c.name AS 'Danh mục',
            IF(c.is_defect, 'Có', 'Không') AS 'Hàng lỗi',
            SUM(oi.quantity) AS 'Số lượng bán',
            SUM(oi.unit_price * oi.quantity) AS 'Doanh thu'
        FROM Order_Items oi
        JOIN Products p ON p.id = oi.product_id
        JOIN Categories c ON c.id = p.category_id
        JOIN Orders o ON o.id = oi.order_id
        ${clause}
        GROUP BY c.id, c.name, c.is_defect
        ORDER BY SUM(oi.unit_price * oi.quantity) DESC
    `, params);

    const [[summaryRow]] = await db.execute(`
        SELECT 
            COUNT(o.id) AS 'Số đơn hoàn thành',
            COALESCE(SUM(o.final_amount), 0) AS 'Tổng doanh thu'
        FROM Orders o
        ${clause}
    `, params);

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet([summaryRow]), 'Tổng hợp');
    xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(orderRows), 'Chi tiết đơn');
    xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(categoryRows), 'Theo danh mục');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const suffix = startDate || endDate
        ? `-${startDate || 'all'}-${endDate || 'all'}`
        : '';
    
    res.setHeader('Content-Disposition', `attachment; filename=bao-cao-doanh-thu${suffix}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
});

// ========== QUẢN LÝ SẢN PHẨM ==========
exports.getAllProducts = asyncHandler(async (req, res) => {
    // Lấy tất cả sản phẩm
    const [products] = await db.execute(`
        SELECT p.*, c.name AS category_name, pi.image_url AS thumbnail
        FROM Products p
        JOIN Categories c ON c.id = p.category_id
        LEFT JOIN Product_Images pi ON pi.product_id = p.id AND pi.is_thumbnail = TRUE
        WHERE p.deleted_at IS NULL
        ORDER BY p.id DESC
    `);

    // Lấy tất cả variants cho các sản phẩm này
    if (products.length > 0) {
        const productIds = products.map(p => p.id);
        const [variants] = await db.execute(`
            SELECT * FROM Product_Variants 
            WHERE product_id IN (${productIds.join(',')})
        `);

        // Ánh xạ variants vào sản phẩm
        products.forEach(p => {
            p.variants = variants.filter(v => v.product_id === p.id);
        });
    }

    res.json({ success: true, data: products });
});

exports.addProduct = asyncHandler(async (req, res) => {
    const { name, base_price, category_id, image_url, description, is_best_seller, variants } = req.body;

    if (!name || !base_price || !category_id) {
        throw new AppError('Vui lòng điền đầy đủ thông tin sản phẩm!', 400);
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [result] = await conn.execute(
            'INSERT INTO Products (category_id, name, base_price, description, is_best_seller) VALUES (?, ?, ?, ?, ?)',
            [category_id, name, base_price, description || '', is_best_seller || false]
        );
        const productId = result.insertId;

        // Ảnh
        if (image_url) {
            await conn.execute(
                'INSERT INTO Product_Images (product_id, image_url, is_thumbnail) VALUES (?, ?, TRUE)',
                [productId, image_url]
            );
        }

        // Variants
        if (variants && variants.length > 0) {
            for (const v of variants) {
                await conn.execute(
                    'INSERT INTO Product_Variants (product_id, sku, size_name, price_adjustment, stock_quantity) VALUES (?, ?, ?, ?, ?)',
                    [productId, v.sku || null, v.size_name, v.price_adjustment || 0, v.stock_quantity || 0]
                );
            }
        } else {
            // Tạo variant mặc định
            await conn.execute(
                'INSERT INTO Product_Variants (product_id, size_name, price_adjustment, stock_quantity) VALUES (?, ?, 0, 10)',
                [productId, 'Mặc định']
            );
        }

        await conn.commit();
        res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công!', productId });
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
});

exports.updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, base_price, category_id, description, is_best_seller, image_url, variants } = req.body;

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Cập nhật thông tin cơ bản
        await conn.execute(
            'UPDATE Products SET name = ?, base_price = ?, category_id = ?, description = ?, is_best_seller = ? WHERE id = ?',
            [name, base_price, category_id, description, is_best_seller || false, id]
        );

        // 2. Cập nhật ảnh
        if (image_url) {
            const [existingImg] = await conn.execute('SELECT id FROM Product_Images WHERE product_id = ? AND is_thumbnail = TRUE', [id]);
            if (existingImg.length > 0) {
                await conn.execute('UPDATE Product_Images SET image_url = ? WHERE product_id = ? AND is_thumbnail = TRUE', [image_url, id]);
            } else {
                await conn.execute('INSERT INTO Product_Images (product_id, image_url, is_thumbnail) VALUES (?, ?, TRUE)', [id, image_url]);
            }
        }

        // 3. Cập nhật Variants
        if (variants && variants.length > 0) {
            const keptIds = [];
            for (const v of variants) {
                if (v.id) {
                    keptIds.push(Number(v.id));
                    await conn.execute(
                        'UPDATE Product_Variants SET sku = ?, size_name = ?, price_adjustment = ?, stock_quantity = ? WHERE id = ? AND product_id = ?',
                        [v.sku || null, v.size_name, v.price_adjustment || 0, v.stock_quantity || 0, v.id, id]
                    );
                } else {
                    const [variantResult] = await conn.execute(
                        'INSERT INTO Product_Variants (product_id, sku, size_name, price_adjustment, stock_quantity) VALUES (?, ?, ?, ?, ?)',
                        [id, v.sku || null, v.size_name, v.price_adjustment || 0, v.stock_quantity || 0]
                    );
                    keptIds.push(variantResult.insertId);
                }
            }

            if (keptIds.length > 0) {
                const placeholders = keptIds.map(() => '?').join(',');
                const [removed] = await conn.execute(
                    `SELECT id FROM Product_Variants WHERE product_id = ? AND id NOT IN (${placeholders})`,
                    [id, ...keptIds]
                );
                for (const row of removed) {
                    const [[refs]] = await conn.execute(
                        `SELECT
                            (SELECT COUNT(*) FROM Order_Items WHERE variant_id = ?) +
                            (SELECT COUNT(*) FROM Cart_Items WHERE variant_id = ?) AS ref_count`,
                        [row.id, row.id]
                    );
                    if (Number(refs.ref_count) === 0) {
                        await conn.execute('DELETE FROM Product_Variants WHERE id = ?', [row.id]);
                    } else {
                        await conn.execute('UPDATE Product_Variants SET stock_quantity = 0 WHERE id = ?', [row.id]);
                    }
                }
            }
        }

        await conn.commit();
        res.json({ success: true, message: 'Cập nhật sản phẩm thành công!' });
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
});

exports.deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [blocked] = await db.execute(
        `SELECT oi.id FROM Order_Items oi
         INNER JOIN Orders o ON o.id = oi.order_id
         WHERE oi.product_id = ? AND o.status NOT IN ('cancelled')
         LIMIT 1`,
        [id]
    );
    if (blocked.length > 0) {
        throw new AppError('Không thể ẩn sản phẩm đang nằm trong đơn hàng chưa hủy. Hãy hủy hoặc hoàn tất các đơn liên quan trước.', 400);
    }
    await db.execute('UPDATE Products SET deleted_at = NOW() WHERE id = ?', [id]);
    res.json({ success: true, message: 'Đã ẩn sản phẩm' });
});

// ========== QUẢN LÝ ĐƠN HÀNG ==========
exports.getAllOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
        whereClause += ' AND o.status = ?';
        params.push(status);
    }

    if (search) {
        whereClause += ' AND (u.fullname LIKE ? OR u.email LIKE ? OR o.id LIKE ?)';
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
    }

    const [[{ total }]] = await db.execute(`
        SELECT COUNT(DISTINCT o.id) AS total 
        FROM Orders o 
        JOIN Users u ON u.id = o.user_id 
        ${whereClause}
    `, params);

    const [orders] = await db.execute(`
        SELECT o.*, u.fullname, u.email, u.phone,
            p.payment_method, p.payment_status,
            COUNT(oi.id) AS item_count
        FROM Orders o
        JOIN Users u ON u.id = o.user_id
        LEFT JOIN Payments p ON p.order_id = o.id
        LEFT JOIN Order_Items oi ON oi.order_id = o.id
        ${whereClause}
        GROUP BY o.id, u.fullname, u.email, u.phone, p.payment_method, p.payment_status
        ORDER BY o.order_date DESC
        LIMIT ${limit} OFFSET ${offset}
    `, params);

    res.json({ 
        success: true, 
        data: orders,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'baking', 'shipping', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        throw new AppError('Trạng thái không hợp lệ', 400);
    }

    const [orderRows] = await db.execute('SELECT user_id, status, final_amount FROM Orders WHERE id = ?', [id]);
    if (orderRows.length === 0) {
        throw new AppError('Không tìm thấy đơn hàng', 404);
    }
    const order = orderRows[0];
    const oldStatus = order.status;

    if (oldStatus === status) {
        return res.json({ success: true, message: 'Trạng thái không đổi' });
    }

    const [payRows] = await db.execute(
        'SELECT payment_method, payment_status FROM Payments WHERE order_id = ?',
        [id]
    );
    const payment = payRows[0] || {};
    assertPaidBeforeStatus(payment.payment_method, payment.payment_status, status);
    assertTransition(oldStatus, status);

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            await restoreStockForOrder(conn, id);
        }

        await conn.execute('UPDATE Orders SET status = ? WHERE id = ?', [status, id]);

        if (status === 'completed') {
            await conn.execute(
                "UPDATE Payments SET payment_status = 'paid', paid_at = NOW() WHERE order_id = ?", [id]
            );
            
            // Tích điểm & Cập nhật chi tiêu (Priority 2: Membership)
            const { processOrderLoyalty } = require('../services/membershipService');
            try {
                await processOrderLoyalty(conn, order.user_id, id, order.final_amount);
            } catch (err) {
                console.warn('Lỗi khi cập nhật điểm thưởng:', err.message);
            }
        }

        await conn.commit();
    } catch (e) {
        await conn.rollback();
        throw e;
    } finally {
        conn.release();
    }

    const statusMap = {
        confirmed: 'Đã xác nhận',
        baking: 'Đang được làm bánh',
        shipping: 'Đang giao hàng',
        completed: 'Đã hoàn thành',
        cancelled: 'Đã bị hủy',
    };
    const statusText = statusMap[status] || status;
    const notificationController = require('./notificationController');
    try {
        await notificationController.createNotification({
            user_id: order.user_id,
            title: 'Cập nhật đơn hàng',
            message: `Đơn hàng #${id} của bạn: ${statusText}.`,
            type: 'order',
        });
    } catch (notifyErr) {
        console.error('Không tạo được thông báo cho khách:', notifyErr.message || notifyErr);
    }

    const [emRows] = await db.execute('SELECT email FROM Users WHERE id = ?', [order.user_id]);
    const { sendOrderStatusEmail } = require('../services/mail');
    void sendOrderStatusEmail({
        to: emRows[0]?.email,
        orderId: id,
        statusLabel: statusText,
    });

    res.json({ success: true, message: `Đã cập nhật trạng thái → ${status}` });
});

exports.confirmPayment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const [orderRows] = await db.execute('SELECT user_id, status, final_amount FROM Orders WHERE id = ?', [id]);
    if (orderRows.length === 0) {
        throw new AppError('Khong tim thay don hang', 404);
    }
    const order = orderRows[0];

    if (order.status === 'cancelled') {
        throw new AppError('Khong the xac nhan thanh toan cho don da huy.', 400);
    }

    const conn = await db.getConnection();
    let earnedPoints = 0;
    try {
        await conn.beginTransaction();

        const [paymentRows] = await conn.execute('SELECT payment_status FROM Payments WHERE order_id = ? FOR UPDATE', [id]);
        if (paymentRows[0]?.payment_status === 'paid') {
            throw new AppError('Don hang nay da duoc xac nhan thanh toan.', 400);
        }

        await conn.execute(
            "UPDATE Payments SET payment_status = 'paid', paid_at = NOW() WHERE order_id = ?",
            [id]
        );

        if (order.status === 'pending') {
            await conn.execute("UPDATE Orders SET status = 'confirmed' WHERE id = ?", [id]);
        }

        const { processOrderLoyalty } = require('../services/membershipService');
        const loyaltyResult = await processOrderLoyalty(conn, order.user_id, id, order.final_amount);
        earnedPoints = loyaltyResult.points || 0;

        await conn.commit();

        const notificationController = require('./notificationController');
        await notificationController.createNotification({
            user_id: order.user_id,
            title: 'Đã xác nhận thanh toán',
            message: `Đơn hàng #${id} đã được xác nhận thanh toán. Điểm thưởng: +${earnedPoints}.`,
            type: 'order',
        });

        const { sendOrderStatusEmail } = require('../services/mail');
        const [emRows] = await db.execute('SELECT email FROM Users WHERE id = ?', [order.user_id]);
        void sendOrderStatusEmail({
            to: emRows[0]?.email,
            orderId: id,
            statusLabel: order.status === 'pending' ? 'Đã xác nhận (đã thanh toán)' : 'Đã thanh toán',
        });

        res.json({ success: true, message: 'Đã xác nhận thanh toán và cập nhật đơn cho khách!' });
    } catch (e) {
        await conn.rollback();
        throw e;
    } finally {
        conn.release();
    }
});
// ========== QUẢN LÝ TÀI KHOẢN ==========
exports.getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search;

    let whereClause = 'WHERE u.deleted_at IS NULL';
    const params = [];

    if (search) {
        whereClause += ' AND (u.fullname LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
    }

    const [[{ total }]] = await db.execute(`
        SELECT COUNT(*) AS total FROM Users u ${whereClause}
    `, params);

    const [users] = await db.execute(`
        SELECT u.id, u.fullname, u.email, u.phone, u.created_at, u.loyalty_points, u.total_spent, u.membership_tier, r.role_name,
            COUNT(DISTINCT o.id) AS order_count
        FROM Users u
        JOIN Roles r ON r.id = u.role_id
        LEFT JOIN Orders o ON o.user_id = u.id
        ${whereClause}
        GROUP BY u.id, u.fullname, u.email, u.phone, u.created_at, u.loyalty_points, u.total_spent, u.membership_tier, r.role_name
        ORDER BY u.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
    `, params);

    res.json({ 
        success: true, 
        data: users,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    });
});

// ========== DANH MỤC ==========
exports.getCategories = asyncHandler(async (req, res) => {
    const [categories] = await db.query(`
        SELECT 
            c.*,
            COUNT(DISTINCT p.id) AS product_count,
            COALESCE(SUM(pv.stock_quantity), 0) AS total_stock
        FROM Categories c
        LEFT JOIN Products p ON p.category_id = c.id AND p.deleted_at IS NULL
        LEFT JOIN Product_Variants pv ON pv.product_id = p.id
        GROUP BY c.id
        ORDER BY c.id
    `);
    const data = categories.map((c) => ({
        ...c,
        product_count: toNum(c.product_count),
        total_stock: toNum(c.total_stock),
        is_defect: Boolean(c.is_defect),
    }));
    res.json({ success: true, data });
});

exports.addCategory = asyncHandler(async (req, res) => {
    const { name, description, image, is_active, is_defect } = req.body;
    if (!name) throw new AppError('Tên danh mục không được để trống', 400);

    if (is_defect) {
        const [existing] = await db.execute('SELECT id FROM Categories WHERE is_defect = TRUE LIMIT 1');
        if (existing.length > 0) {
            throw new AppError('Chỉ được có một danh mục hàng bị lỗi. Hãy cập nhật danh mục hiện có.', 400);
        }
    }

    const [result] = await db.execute(
        'INSERT INTO Categories (name, description, image, is_active, is_defect) VALUES (?, ?, ?, ?, ?)',
        [name, description || '', image || null, is_active !== undefined ? is_active : true, Boolean(is_defect)]
    );

    res.status(201).json({ success: true, message: 'Thêm danh mục thành công!', categoryId: result.insertId });
});

exports.updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, image, is_active, is_defect } = req.body;

    if (is_defect === true) {
        const [existing] = await db.execute(
            'SELECT id FROM Categories WHERE is_defect = TRUE AND id != ? LIMIT 1',
            [id]
        );
        if (existing.length > 0) {
            throw new AppError('Chỉ được có một danh mục hàng bị lỗi.', 400);
        }
    }

    const updates = [];
    const params = [];
    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (image !== undefined) { updates.push('image = ?'); params.push(image); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active); }
    if (is_defect !== undefined) { updates.push('is_defect = ?'); params.push(Boolean(is_defect)); }

    if (updates.length === 0) {
        throw new AppError('Không có thông tin cập nhật', 400);
    }

    params.push(id);
    await db.execute(`UPDATE Categories SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ success: true, message: 'Cập nhật danh mục thành công!' });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if category has products
    const [products] = await db.execute('SELECT id FROM Products WHERE category_id = ? AND deleted_at IS NULL LIMIT 1', [id]);
    if (products.length > 0) {
        throw new AppError('Không thể xóa danh mục đang có sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước.', 400);
    }

    await db.execute('DELETE FROM Categories WHERE id = ?', [id]);
    res.json({ success: true, message: 'Đã xóa danh mục' });
});

// ========== QUẢN LÝ KHUYẾN MÃI (COUPONS) ==========
exports.getAllCoupons = asyncHandler(async (req, res) => {
    const [coupons] = await db.execute('SELECT * FROM Coupons ORDER BY id DESC');
    res.json({ success: true, data: coupons });
});

exports.addCoupon = asyncHandler(async (req, res) => {
    const { code, discount_type, discount_value, min_order_value, max_discount_amount, usage_limit, valid_from, valid_until } = req.body;
    const normalizedCode = String(code || '').trim().toUpperCase();

    if (!normalizedCode || !discount_type || !discount_value) {
        throw new AppError('Vui lòng điền đầy đủ thông tin mã khuyến mãi!', 400);
    }

    const [result] = await db.execute(
        `INSERT INTO Coupons (code, discount_type, discount_value, min_order_value, max_discount_amount, usage_limit, valid_from, valid_until)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [normalizedCode, discount_type, discount_value, min_order_value || 0, max_discount_amount || null, usage_limit || 100, valid_from || null, valid_until || null]
    );

    // Thông báo cho tất cả người dùng (user_id = NULL)
    try {
        const notificationController = require('./notificationController');
        await notificationController.createNotification({
            user_id: null, // Global notification
            title: '🎁 Mã giảm giá mới!',
            message: `Tiệm bánh vừa ra mắt mã: ${normalizedCode}. Giảm ${discount_type === 'percent' ? discount_value + '%' : Number(discount_value).toLocaleString() + 'đ'} cho đơn hàng từ ${Number(min_order_value || 0).toLocaleString()}đ.`,
            type: 'promo'
        });
    } catch (err) {
        console.warn('Lỗi tạo thông báo khuyến mãi:', err.message);
    }

    res.status(201).json({ success: true, message: 'Thêm mã khuyến mãi thành công!', couponId: result.insertId });
});

exports.updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { code, discount_type, discount_value, min_order_value, max_discount_amount, usage_limit, is_active, valid_from, valid_until } = req.body;

    let query = 'UPDATE Coupons SET ';
    const params = [];
    const updates = [];

    if (code !== undefined) { updates.push('code = ?'); params.push(String(code).trim().toUpperCase()); }
    if (discount_type !== undefined) { updates.push('discount_type = ?'); params.push(discount_type); }
    if (discount_value !== undefined) { updates.push('discount_value = ?'); params.push(discount_value); }
    if (min_order_value !== undefined) { updates.push('min_order_value = ?'); params.push(min_order_value); }
    if (max_discount_amount !== undefined) { updates.push('max_discount_amount = ?'); params.push(max_discount_amount || null); }
    if (usage_limit !== undefined) { updates.push('usage_limit = ?'); params.push(usage_limit); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active); }
    if (valid_from !== undefined) { updates.push('valid_from = ?'); params.push(valid_from || null); }
    if (valid_until !== undefined) { updates.push('valid_until = ?'); params.push(valid_until || null); }

    if (updates.length === 0) {
        throw new AppError('Không có thông tin cập nhật', 400);
    }

    query += updates.join(', ') + ' WHERE id = ?';
    params.push(id);

    await db.execute(query, params);
    res.json({ success: true, message: 'Cập nhật mã khuyến mãi thành công!' });
});

exports.importProducts = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new AppError('Vui lòng tải lên một tệp tin (Excel/CSV)!', 400);
    }

    // 1. Đọc file từ buffer
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (data.length === 0) {
        throw new AppError('File Excel không có dữ liệu!', 400);
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // Lấy danh sách danh mục để ánh xạ tên -> id
        const [categories] = await conn.execute('SELECT id, name FROM Categories');
        const categoryMap = {};
        categories.forEach(c => categoryMap[c.name.toLowerCase()] = c.id);

        let successCount = 0;
        let skipCount = 0;

        for (const row of data) {
            const name = row['Tên sản phẩm'] || row['Name'];
            const categoryName = row['Danh mục'] || row['Category'];
            const basePrice = row['Giá cơ bản'] || row['BasePrice'] || 0;
            const description = row['Mô tả'] || row['Description'] || '';
            const imageUrl = row['Ảnh'] || row['ImageUrl'];
            
            if (!name || !categoryName) {
                skipCount++;
                continue;
            }

            const categoryId = categoryMap[categoryName.toLowerCase()];
            if (!categoryId) {
                skipCount++;
                continue;
            }

            // Xử lý ảnh fallback thông minh
            let finalImageUrl = imageUrl;
            if (!finalImageUrl) {
                // Tạo link Unsplash theo tên sản phẩm (không dấu)
                const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
                finalImageUrl = `https://source.unsplash.com/featured/?bakery,${slug}`;
            }

            // 2. Chèn sản phẩm
            const [productResult] = await conn.execute(
                'INSERT INTO Products (category_id, name, base_price, description) VALUES (?, ?, ?, ?)',
                [categoryId, name, basePrice, description]
            );
            const productId = productResult.insertId;

            // 3. Chèn ảnh
            await conn.execute(
                'INSERT INTO Product_Images (product_id, image_url, is_thumbnail) VALUES (?, ?, TRUE)',
                [productId, finalImageUrl]
            );

            // 4. Chèn Variant mặc định hoặc từ file
            const sizeName = row['Size'] || 'Mặc định';
            const priceAdj = row['Giá thêm'] || 0;
            const stock = row['Tồn kho'] || 50;

            await conn.execute(
                'INSERT INTO Product_Variants (product_id, sku, size_name, price_adjustment, stock_quantity) VALUES (?, ?, ?, ?, ?)',
                [productId, `SKU-${productId}-IMPORT`, sizeName, priceAdj, stock]
            );

            successCount++;
        }

        await conn.commit();
        res.json({ 
            success: true, 
            message: `Import thành công ${successCount} sản phẩm!${skipCount > 0 ? ` (Bỏ qua ${skipCount} dòng không hợp lệ)` : ''}` 
        });
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
    await db.execute('UPDATE Coupons SET is_active = FALSE WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Đã ẩn mã khuyến mãi' });
});

// ========== QUẢN LÝ ĐÁNH GIÁ (VIEW ONLY) ==========
exports.getAllReviews = asyncHandler(async (req, res) => {
    const { productId } = req.query;
    
    let query = `
        SELECT r.*, u.fullname, p.name AS product_name, pi.image_url AS thumbnail
        FROM Reviews r
        JOIN Users u ON u.id = r.user_id
        JOIN Products p ON p.id = r.product_id
        LEFT JOIN Product_Images pi ON pi.product_id = p.id AND pi.is_thumbnail = TRUE
    `;
    const params = [];

    if (productId) {
        query += ` WHERE r.product_id = ?`;
        params.push(productId);
    }

    query += ` ORDER BY r.created_at DESC`;

    const [reviews] = await db.execute(query, params);
    res.json({ success: true, data: reviews });
});

// ========== QUẢN LÝ CÀI ĐẶT CỬA HÀNG ==========
exports.getStoreSettings = asyncHandler(async (req, res) => {
    const [settings] = await db.execute('SELECT * FROM Store_Settings');
    const settingsMap = {};
    settings.forEach(s => settingsMap[s.key] = s.value);
    res.json({ success: true, data: settingsMap });
});

exports.updateStoreSettings = asyncHandler(async (req, res) => {
    const { site_name, site_logo } = req.body;

    if (site_name) {
        await db.execute('INSERT INTO Store_Settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?', 
            ['site_name', site_name, site_name]);
    }
    if (site_logo) {
        await db.execute('INSERT INTO Store_Settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?', 
            ['site_logo', site_logo, site_logo]);
    }

    res.json({ success: true, message: 'Cập nhật cài đặt thành công!' });
});
