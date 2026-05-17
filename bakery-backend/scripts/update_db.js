const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDb() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Adding stock_quantity to products...');
        await connection.query(`
            ALTER TABLE Products ADD COLUMN stock_quantity INT DEFAULT 0;
        `);
        console.log('Creating Store_Settings table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Store_Settings (
                \`key\` VARCHAR(50) PRIMARY KEY,
                \`value\` TEXT
            );
        `);
        
        // Seed default settings
        await connection.query(`
            INSERT IGNORE INTO Store_Settings (\`key\`, \`value\`) VALUES 
            ('site_name', 'HXH Bakery'),
            ('site_logo', 'https://res.cloudinary.com/dqr68393/image/upload/v1/logo_bakery');
        `);

        console.log('✅ Database updated successfully!');
    } catch (err) {
        console.error('❌ Error updating database:', err);
    } finally {
        await connection.end();
    }
}

updateDb();
