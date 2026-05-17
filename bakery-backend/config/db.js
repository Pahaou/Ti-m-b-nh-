const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.getConnection()
    .then(connection => {
        console.log('✅ Đã kết nối thành công với Database Tiệm Bánh trên Aiven!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Lỗi kết nối Database:', err);
    });

/** Kiểm tra pool còn lấy được kết nối (dùng cho GET /health). */
pool.checkDbHealth = async function checkDbHealth() {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        return { ok: true };
    } catch (err) {
        return { ok: false, error: err.message };
    }
};

module.exports = pool;