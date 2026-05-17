const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { buildMoMoRequest } = require('../services/payment/momoProvider');
const { buildVNPayRequest } = require('../services/payment/vnpayProvider');

/**
 * POST /api/payments/intent — tạo yêu cầu thanh toán online (MoMo / stub VNPay).
 * Đơn phải thuộc user, trạng thái pending.
 */
exports.createIntent = asyncHandler(async (req, res) => {
    const { provider = 'momo', orderId, amount } = req.body;
    if (!orderId) {
        throw new AppError('Thiếu orderId', 400);
    }

    const [orders] = await db.execute(
        'SELECT id, user_id, status, final_amount FROM Orders WHERE id = ? AND user_id = ?',
        [orderId, req.user.id]
    );
    if (orders.length === 0) {
        throw new AppError('Không tìm thấy đơn hàng', 404);
    }
    const order = orders[0];
    if (order.status !== 'pending') {
        throw new AppError('Chỉ thanh toán online khi đơn đang chờ xác nhận.', 400);
    }

    const payAmount = amount != null ? Number(amount) : Number(order.final_amount);

    if (provider === 'vnpay') {
        const vnpayResult = buildVNPayRequest({ 
            orderId: String(orderId), 
            amount: payAmount,
            ipAddr: req.ip || '127.0.0.1'
        });
        return res.json({ success: true, data: vnpayResult });
    }

    if (provider !== 'momo') {
        throw new AppError('Provider không hỗ trợ', 400);
    }

    const momoOrderId = `HXH${orderId}-${Date.now()}`;
    const built = buildMoMoRequest({
        orderId: momoOrderId,
        amount: payAmount,
        orderInfo: `Thanh toan don ${orderId}`,
        extraData: JSON.stringify({ internalOrderId: orderId }),
    });

    if (!built.configured) {
        return res.json({ success: true, data: built });
    }

    const r = await fetch(built.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(built.body),
    });
    const data = await r.json().catch(() => ({}));

    res.json({
        success: true,
        data: {
            configured: true,
            resultCode: data.resultCode,
            message: data.message,
            payUrl: data.payUrl || null,
            deeplink: data.deeplink || null,
            requestId: built.requestId,
            momoOrderId,
        },
    });
});

/** MoMo IPN — xác nhận thanh toán */
exports.momoIpn = asyncHandler(async (req, res) => {
    const payload = req.body;
    const { resultCode, orderId, extraData } = payload;
    
    console.log('[payment] MoMo IPN:', orderId, resultCode);

    if (resultCode === 0) {
        let internalOrderId = orderId;
        try {
            const extra = JSON.parse(extraData);
            if (extra.internalOrderId) internalOrderId = extra.internalOrderId;
        } catch (e) {}

        await updateOrderAsPaid(internalOrderId, 'MOMO', orderId);
    }

    res.status(200).send(JSON.stringify({ message: 'received' }));
});

/** VNPay Return — xử lý khi khách quay lại web */
exports.vnpayReturn = asyncHandler(async (req, res) => {
    const vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    // In production, you MUST verify the signature here
    // For sandbox, we check vnp_ResponseCode
    const responseCode = vnp_Params['vnp_ResponseCode'];
    const orderId = vnp_Params['vnp_TxnRef'];

    if (responseCode === '00') {
        await updateOrderAsPaid(orderId, 'VNPAY', vnp_Params['vnp_TransactionNo']);
        // Redirect to a success page or my-orders
        res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:5173'}/my-orders?payment=success&orderId=${orderId}`);
    } else {
        res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:5173'}/my-orders?payment=failed&orderId=${orderId}`);
    }
});

// Helper to update order as paid and notify
async function updateOrderAsPaid(orderId, method, transId) {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        await conn.execute(
            'UPDATE Payments SET payment_status = "paid", paid_at = NOW(), transaction_id = ? WHERE order_id = ?',
            [transId, orderId]
        );

        await conn.execute("UPDATE Orders SET status = 'confirmed' WHERE id = ? AND status = 'pending'", [orderId]);

        const [orders] = await conn.execute('SELECT user_id, final_amount FROM Orders WHERE id = ?', [orderId]);
        if (orders.length > 0) {
            const { user_id, final_amount } = orders[0];
            const { processOrderLoyalty } = require('../services/membershipService');
            const loyaltyResult = await processOrderLoyalty(conn, user_id, orderId, final_amount);
            const earnedPoints = loyaltyResult.points || 0;

            const notificationController = require('./notificationController');
            await notificationController.createNotification({
                user_id,
                title: 'Thanh toan thanh cong',
                message: `Chung toi da nhan duoc ${Number(final_amount).toLocaleString()}d cho don hang #${orderId}. Diem duoc cong: ${earnedPoints}.`,
                type: 'order'
            });

            await notificationController.createNotification({
                user_id: null,
                title: 'Thanh toan moi',
                message: `Don hang #${orderId} da duoc thanh toan qua ${method}. Tong tien: ${Number(final_amount).toLocaleString()}d`,
                type: 'system'
            });
        }

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        console.error('Update payment error:', error);
    } finally {
        conn.release();
    }
}
/** VNPay MOCK GATEWAY — Trang giả lập VNPay để test cho nhanh */
exports.vnpayMock = asyncHandler(async (req, res) => {
    const params = req.query;
    const orderId = params.vnp_TxnRef;
    const amount = Number(params.vnp_Amount) / 100;
    
    // Trả về trang HTML giả lập VNPay
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>VNPay Mock Gateway</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: -apple-system, sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .card { background: white; padding: 40px; borderRadius: 20px; boxShadow: 0 10px 30px rgba(0,0,0,0.1); width: 100%; maxWidth: 400px; textAlign: center; }
                .logo { color: #005baa; fontSize: 24px; fontWeight: 900; marginBottom: 20px; }
                .amount { fontSize: 32px; fontWeight: 800; color: #d32f2f; margin: 20px 0; }
                .btn { display: block; width: 100%; padding: 15px; border: none; borderRadius: 10px; fontSize: 16px; fontWeight: 600; cursor: pointer; marginBottom: 10px; transition: 0.2s; }
                .btn-success { background: #005baa; color: white; }
                .btn-success:hover { background: #004a8c; }
                .btn-cancel { background: #eee; color: #666; }
                .btn-cancel:hover { background: #ddd; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="logo">VNPAY <span style="color: #ed1c24">MOCK</span></div>
                <div style="color: #666">Đang thanh toán đơn hàng <strong>#${orderId}</strong></div>
                <div class="amount">${amount.toLocaleString()}đ</div>
                
                <button class="btn btn-success" onclick="finish('00')">Xác nhận thanh toán (Thành công)</button>
                <button class="btn btn-cancel" onclick="finish('24')">Hủy giao dịch</button>
                
                <p style="fontSize: 12px; color: #999; marginTop: 20px">Đây là môi trường giả lập của HXH Bakery</p>
            </div>

            <script>
                function finish(code) {
                    const urlParams = new URLSearchParams(window.location.search);
                    const returnUrl = urlParams.get('vnp_ReturnUrl');
                    
                    // Xây dựng URL phản hồi
                    const resUrl = new URL(returnUrl);
                    resUrl.searchParams.set('vnp_ResponseCode', code);
                    resUrl.searchParams.set('vnp_TxnRef', urlParams.get('vnp_TxnRef'));
                    resUrl.searchParams.set('vnp_Amount', urlParams.get('vnp_Amount'));
                    resUrl.searchParams.set('vnp_TransactionNo', 'MOCK' + Date.now());
                    resUrl.searchParams.set('vnp_SecureHash', 'MOCK_HASH'); // Skip hash check in mock
                    
                    window.location.href = resUrl.toString();
                }
            </script>
        </body>
        </html>
    `);
});
