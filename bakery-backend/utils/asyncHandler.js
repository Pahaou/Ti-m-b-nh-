/**
 * Wrapper cho async controller - tự động catch error và gọi next(error)
 * Loại bỏ try-catch lặp lại trong mỗi controller
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
