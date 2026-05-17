/**
 * Stub VNPay — cùng pattern với MoMo: cấu hình env sau này sẽ trả payUrl thật.
 */
function buildVNPayStub({ orderId, amount }) {
    const tmnCode = process.env.VNPAY_TMN_CODE;
    if (!tmnCode) {
        return {
            configured: false,
            payUrl: null,
            message: 'VNPay chưa cấu hình (VNPAY_TMN_CODE).',
        };
    }
    return {
        configured: true,
        payUrl: null,
        message: 'VNPay: triển khai ký query + redirect trong phase tiếp theo.',
        orderId,
        amount,
    };
}

module.exports = { buildVNPayStub };
