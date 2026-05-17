/**
 * Custom Error class cho API
 * Sử dụng: throw new AppError('Message', statusCode)
 */
class AppError extends Error {
    constructor(message, statusCode, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        if (errorCode) this.errorCode = errorCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
