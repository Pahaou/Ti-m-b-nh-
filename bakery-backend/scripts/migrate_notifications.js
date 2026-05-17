const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await conn.query("ALTER TABLE Notifications ADD COLUMN type ENUM('system', 'order', 'promo') DEFAULT 'system' AFTER message");
        console.log('✅ Đã thêm cột type vào bảng Notifications');
    } catch (e) {
        console.log('ℹ️ Kết quả:', e.message);
    }

    await conn.end();
}

migrate().catch(console.error);
