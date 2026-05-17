const db = require('../config/db');

async function createNotificationsTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS Notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type ENUM('order', 'promo', 'system') NOT NULL DEFAULT 'system',
                is_read BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Bảng Notifications đã được tạo hoặc đã tồn tại.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi tạo bảng:', err);
        process.exit(1);
    }
}

createNotificationsTable();
