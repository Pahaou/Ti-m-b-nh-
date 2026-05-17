const crypto = require('crypto');

/**
 * VNPay Sandbox Implementation.
 * @see https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/
 */
function buildVNPayRequest({ orderId, amount, ipAddr = '127.0.0.1' }) {
    const tmnCode = process.env.VNPAY_TMN_CODE || '2QX1X6S7'; 
    const hashSecret = process.env.VNPAY_HASH_SECRET || 'A5RAOSYABW7S9BTORH6W9WRE6397P3B4'; 
    const vnpUrl = process.env.VNPAY_URL || 'http://localhost:5000/api/payments/vnpay-mock';
    const returnUrl = process.env.VNPAY_RETURN_URL || 'http://localhost:5000/api/payments/vnpay/return';

    const date = new Date();
    // YYYYMMDDHHmmss in GMT+7
    const createDate = date.getFullYear().toString() + 
                      (date.getMonth() + 1).toString().padStart(2, '0') + 
                      date.getDate().toString().padStart(2, '0') + 
                      date.getHours().toString().padStart(2, '0') + 
                      date.getMinutes().toString().padStart(2, '0') + 
                      date.getSeconds().toString().padStart(2, '0');
    
    let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: 'DonHang' + orderId,
        vnp_OrderType: 'other',
        vnp_Amount: Math.round(amount * 100),
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
    };

    // Sort params alphabetically
    const sortedParams = {};
    Object.keys(vnp_Params).sort().forEach(key => {
        sortedParams[key] = vnp_Params[key];
    });

    // Manual building for signature - VALUES MUST NOT BE ENCODED
    const signData = Object.keys(sortedParams)
        .map(key => `${key}=${sortedParams[key]}`)
        .join('&');

    const hmac = crypto.createHmac('sha512', hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    sortedParams['vnp_SecureHash'] = signed;
    
    // Final URL - VALUES MUST BE ENCODED
    const searchParams = Object.keys(sortedParams)
        .map(key => `${key}=${encodeURIComponent(sortedParams[key]).replace(/%20/g, '+')}`)
        .join('&');

    const finalUrl = vnpUrl + '?' + searchParams;
    
    console.log('--- VNPAY DEBUG ---');
    console.log('OrderId:', orderId);
    console.log('Amount:', amount);
    console.log('SignData:', signData);
    console.log('Final URL:', finalUrl);
    console.log('-------------------');

    return {
        configured: true,
        payUrl: finalUrl,
        message: 'VNPay Sandbox is ready.',
        orderId,
        amount,
    };
}

module.exports = { buildVNPayRequest };
