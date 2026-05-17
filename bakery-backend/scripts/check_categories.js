const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
  const connection = await mysql.createConnection(process.env.DB_URL || {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });
  const [rows] = await connection.execute('DESC Categories');
  console.log(JSON.stringify(rows, null, 2));
  await connection.end();
}
check().catch(console.error);
