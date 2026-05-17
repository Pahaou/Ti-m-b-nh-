const nodemailer = require('nodemailer');

function createTransport() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        return null;
    }
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS || '',
        },
    });
}

async function sendMailSafe({ to, subject, text, html }) {
    const transporter = createTransport();
    if (!transporter) {
        console.warn('[mail] Bỏ qua gửi mail: chưa cấu hình SMTP_HOST / SMTP_USER');
        return { sent: false, reason: 'not_configured' };
    }
    const from = process.env.MAIL_FROM || process.env.SMTP_USER;
    try {
        await transporter.sendMail({ from, to, subject, text, html });
        return { sent: true };
    } catch (err) {
        console.error('[mail] Gửi thất bại:', err.message);
        return { sent: false, reason: err.message };
    }
}

async function sendOrderPlacedEmail({ to, orderId, amount }) {
    if (!to) return;
    const subject = `[HXH Bakery] Đã nhận đơn #${orderId}`;
    const text = `Cảm ơn bạn đã đặt hàng. Mã đơn: #${orderId}. Tổng thanh toán: ${amount?.toLocaleString?.('vi-VN')}đ. Chúng tôi sẽ xác nhận sớm.`;
    return sendMailSafe({ to, subject, text });
}

async function sendOrderStatusEmail({ to, orderId, status }) {
    if (!to) return;
    const statusMap = {
        'confirmed': 'Đã xác nhận',
        'baking': 'Đang chuẩn bị',
        'shipping': 'Đang giao hàng',
        'completed': 'Đã giao thành công',
        'cancelled': 'Đã hủy'
    };
    const subject = `[HXH Bakery] Đơn hàng #${orderId} - ${statusMap[status] || status}`;
    const text = `Đơn hàng #${orderId} của bạn đã được cập nhật trạng thái: ${statusMap[status] || status}.`;
    return sendMailSafe({ to, subject, text });
}


async function sendForgotPasswordEmail({ to, newPassword }) {
    if (!to) return;
    const subject = `[HXH Bakery] Mật khẩu mới của bạn`;
    const text = `Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn.\n\nMật khẩu mới của bạn là: ${newPassword}\n\nVui lòng đăng nhập và đổi lại mật khẩu ngay để đảm bảo an toàn.`;
    return sendMailSafe({ to, subject, text });
}

module.exports = { 
    sendMailSafe, 
    sendOrderPlacedEmail, 
    sendOrderStatusEmail,
    sendForgotPasswordEmail
};
