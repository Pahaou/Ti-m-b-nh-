const Joi = require('joi');

const schemas = {
    // Order validation
    createOrder: Joi.object({
        shipping_address: Joi.string().required().messages({
            'any.required': 'Vui lòng nhập địa chỉ giao hàng!',
            'string.empty': 'Địa chỉ giao hàng không được để trống!'
        }),
        payment_method: Joi.string().valid('COD', 'VNPAY', 'MOMO', 'TRANSFER').default('COD'),
        customer_note: Joi.string().allow('', null),
        coupon_code: Joi.string().allow('', null)
    }),

    // User validation
    register: Joi.object({
        fullname: Joi.string().required().min(2).max(50),
        email: Joi.string().email().required(),
        password: Joi.string().required().min(6),
        phone: Joi.string().pattern(/^[0-9]{10,11}$/).allow('', null)
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })
};

module.exports = schemas;
