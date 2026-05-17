require('dotenv').config();
const mysql = require('mysql2/promise');

async function runMigrations() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }, // Use false here since we don't have real cert locally
        multipleStatements: true
    });

    const addColumn = async (table, column, definition) => {
        try {
            await conn.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
            console.log(`[+] Added ${column} to ${table}`);
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log(`[i] Column ${column} already exists in ${table}`);
            } else {
                throw e;
            }
        }
    };

    try {
        console.log('Chạy migrations bổ sung cột...');
        
        await addColumn('Users', 'loyalty_points', 'INT DEFAULT 0');
        await addColumn('Users', 'membership_tier', "ENUM('bronze','silver','gold','platinum') DEFAULT 'bronze'");
        await addColumn('Users', 'total_spent', 'DECIMAL(12,2) DEFAULT 0');
        await addColumn('Users', 'email_verified', 'BOOLEAN DEFAULT FALSE');
        await addColumn('Users', 'email_verify_token', 'VARCHAR(100) NULL');
        
        await addColumn('Coupons', 'max_discount_amount', 'DECIMAL(10,2) NULL');
        
        await addColumn('Orders', 'cancelled_reason', 'VARCHAR(255) NULL');
        await addColumn('Orders', 'cancelled_at', 'TIMESTAMP NULL');

        console.log('✅ Đã cập nhật các cột mới.');

        await conn.query(`
            -- Tạo bảng Point_History
            CREATE TABLE IF NOT EXISTS Point_History (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              order_id INT NULL,
              points INT NOT NULL,
              reason VARCHAR(255),
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
              FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE SET NULL
            );

            -- Tạo bảng Password_Reset_Tokens
            CREATE TABLE IF NOT EXISTS Password_Reset_Tokens (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              token VARCHAR(100) NOT NULL UNIQUE,
              expires_at DATETIME NOT NULL,
              used BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
            );
        `);
        console.log('✅ Đã tạo các bảng mới.');
        
        console.log('🎉 Migrations hoàn tất!');
    } catch (err) {
        console.error('Lỗi migration:', err);
    } finally {
        await conn.end();
    }
}

runMigrations();
