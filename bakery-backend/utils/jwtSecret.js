/**
 * JWT secret: bắt buộc trong production; dev có thể dùng fallback cố định.
 */
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (secret && String(secret).trim()) {
        return secret.trim();
    }
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET is required in production');
    }
    return 'bi_mat_cua_tiem_banh';
}

module.exports = { getJwtSecret };
