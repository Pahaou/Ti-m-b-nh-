/**
 * Luồng trạng thái đơn hàng (admin / hệ thống).
 * Không cho nhảy cóc (vd pending -> completed).
 */
const ALLOWED = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['baking', 'cancelled'],
    baking: ['shipping'],
    shipping: ['completed'],
    completed: [],
    cancelled: [],
};

function canTransition(fromStatus, toStatus) {
    if (!fromStatus || !toStatus) return false;
    if (fromStatus === toStatus) return true;
    const next = ALLOWED[fromStatus];
    return Array.isArray(next) && next.includes(toStatus);
}

function assertTransition(fromStatus, toStatus) {
    const AppError = require('./AppError');
    if (fromStatus === toStatus) return;
    if (!canTransition(fromStatus, toStatus)) {
        throw new AppError(
            `Không thể chuyển trạng thái từ "${fromStatus}" sang "${toStatus}".`,
            400
        );
    }
}

module.exports = { canTransition, assertTransition, ALLOWED };
