/** COD: xác nhận đơn trước, thu tiền khi giao. Các cổng online: phải paid trước khi xử lý. */
const PREPAID_METHODS = new Set(['MOMO', 'VNPAY', 'TRANSFER', 'VNPay', 'MoMo']);

function normalizeMethod(method) {
    return String(method || 'COD').trim().toUpperCase();
}

function requiresPrepaid(method) {
    return PREPAID_METHODS.has(normalizeMethod(method));
}

function statusNeedsPayment(status) {
    return ['confirmed', 'baking', 'shipping', 'completed'].includes(status);
}

function assertPaidBeforeStatus(paymentMethod, paymentStatus, nextStatus) {
    if (!statusNeedsPayment(nextStatus)) return;
    if (!requiresPrepaid(paymentMethod)) return;
    if (paymentStatus === 'paid') return;

    const AppError = require('./AppError');
    throw new AppError(
        'Đơn chưa thanh toán. Hãy bấm "Xác nhận tiền" sau khi khách đã chuyển khoản / thanh toán online.',
        400
    );
}

module.exports = {
    PREPAID_METHODS,
    normalizeMethod,
    requiresPrepaid,
    statusNeedsPayment,
    assertPaidBeforeStatus,
};
