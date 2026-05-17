/**
 * Gán mỗi sản phẩm một ảnh thumbnail Unsplash khác nhau (tránh trùng lặp).
 * Chạy: node scratch/update_product_thumbnails.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

/** 48 ảnh bakery/dessert/bread khác id — gán xoay vòng theo thứ tự id, bước nguyên tố để láng giềng ít trùng. */
const IMAGES = [
  'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565958011703-44f4829a1877?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542849964-5509789a5e97?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558636508-e0db3814bd126?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1612203985729-70726954388c?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519869325930-281384150729?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1586985289681-ca30cf7a6e35?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1607958996333-41aef7caef14?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1610632380980-456079975765?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1621213143723-2736239bc341?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542849964-550df98b9272?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1587668178224-9f63d25f51b5?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1590080876204-c2c7765e8b8c?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1602351447937-745cb720612f?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1614707267537-85f61e52b2d2?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1606890737304-57a1ca2da544?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1599785209707-c909d3e3785b?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1607472586893-edb9d886a446?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618420761273-93c03bbb6b04?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1607478900766-efe1b9b13b5a?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1556679343-5370395aee9f?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1478868647527-2746f62f8177?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1598306923354-90c883afd42b?w=900&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&q=85&auto=format&fit=crop&crop=focalpoint',
];

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });

  const [rows] = await connection.query(
    'SELECT id FROM Products WHERE deleted_at IS NULL ORDER BY id ASC'
  );

  let n = 0;
  const step = 11;
  for (let i = 0; i < rows.length; i++) {
    const pid = rows[i].id;
    const url = IMAGES[(i * step) % IMAGES.length];
    const [r] = await connection.execute(
      'UPDATE Product_Images SET image_url = ? WHERE product_id = ? AND is_thumbnail = TRUE',
      [url, pid]
    );
    if (r.affectedRows) n += 1;
  }

  console.log(`Đã cập nhật ảnh thumbnail cho ${n} sản phẩm (${rows.length} dòng).`);
  await connection.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
