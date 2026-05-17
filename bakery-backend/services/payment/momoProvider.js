const crypto = require('crypto');

/**
 * Tạo payload thanh toán MoMo (sandbox / production).
 * Khi thiếu biến môi trường, trả về chế độ mock để frontend vẫn luồng được.
 * @see https://developers.momo.vn/
 */
function buildMoMoRequest({
    orderId,
    amount,
    orderInfo,
    extraData = '',
}) {
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';

    if (!partnerCode || !accessKey || !secretKey) {
        // Use common MoMo sandbox keys if not provided in .env
        const defaultPartnerCode = 'MOMOBKUN20180529';
        const defaultAccessKey = 'klm05TvNBqg7n6uD';
        const defaultSecretKey = 'at67qH6mk8w5Y1n7bbSswW69d8v90K1X';
        
        console.warn('⚠️ MoMo credentials missing in .env. Using default Sandbox keys.');
        
        return buildMoMoRequestInternal({
            partnerCode: defaultPartnerCode,
            accessKey: defaultAccessKey,
            secretKey: defaultSecretKey,
            orderId,
            amount,
            orderInfo,
            extraData,
            endpoint
        });
    }

    return buildMoMoRequestInternal({
        partnerCode,
        accessKey,
        secretKey,
        orderId,
        amount,
        orderInfo,
        extraData,
        endpoint
    });
}

function buildMoMoRequestInternal({
    partnerCode,
    accessKey,
    secretKey,
    endpoint,
    orderId,
    amount,
    orderInfo,
    extraData = ''
}) {
    const extraDataStr = typeof extraData === 'object' ? JSON.stringify(extraData) : String(extraData);


    const requestId = `${partnerCode}${Date.now()}`;
    const redirectUrl = process.env.MOMO_REDIRECT_URL || 'http://localhost:5173/my-orders';
    const ipnUrl = process.env.MOMO_IPN_URL || 'http://localhost:5000/api/payments/momo/ipn';
    const amountStr = String(Math.round(Number(amount)));
    const requestType = 'captureWallet';

    const rawSignature = [
        `partnerCode=${partnerCode}`,
        `accessKey=${accessKey}`,
        `requestId=${requestId}`,
        `amount=${amountStr}`,
        `orderId=${orderId}`,
        `orderInfo=${orderInfo}`,
        `redirectUrl=${redirectUrl}`,
        `ipnUrl=${ipnUrl}`,
        `extraData=${extraDataStr}`,
        `requestType=${requestType}`,
    ].join('&');

    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    const body = {
        partnerCode,
        partnerName: process.env.MOMO_PARTNER_NAME || 'HXH Bakery',
        storeId: process.env.MOMO_STORE_ID || partnerCode,
        requestId,
        amount: amountStr,
        orderId: String(orderId),
        orderInfo,
        redirectUrl,
        ipnUrl,
        lang: 'vi',
        extraData: extraDataStr,
        requestType,
        signature,
    };

    return {
        configured: true,
        endpoint,
        body,
        requestId,
    };
}

module.exports = { buildMoMoRequest };
