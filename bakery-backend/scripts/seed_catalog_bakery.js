/**
 * Bổ sung nhiều mẫu bánh vào DB (không xóa dữ liệu cũ).
 * Chạy: node scratch/seed_catalog_bakery.js
 * Bỏ qua nếu đã có >= 50 sản phẩm (tránh chạy lặp nhân đôi).
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const IMAGES = [
  'https://images.unsplash.com/photo-1565958011703-44f4829a1877?w=800&q=85',
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=85',
  'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=85',
  'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=800&q=85',
  'https://images.unsplash.com/photo-1542849964-5509789a5e97?w=800&q=85',
  'https://images.unsplash.com/photo-1558636508-e0db3814bd126?w=800&q=85',
  'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&q=85',
  'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=85',
  'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=800&q=85',
  'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=800&q=85',
  'https://images.unsplash.com/photo-1612203985729-70726954388c?w=800&q=85',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=85',
  'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=85',
  'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&q=85',
  'https://images.unsplash.com/photo-1519869325930-281384150729?w=800&q=85',
  'https://images.unsplash.com/photo-1586985289681-ca30cf7a6e35?w=800&q=85',
  'https://images.unsplash.com/photo-1607958996333-41aef7caef14?w=800&q=85',
  'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=800&q=85',
  'https://images.unsplash.com/photo-1610632380980-456079975765?w=800&q=85',
  'https://images.unsplash.com/photo-1621213143723-2736239bc341?w=800&q=85',
];

const CATALOG = [
  // Bánh Mì và Bánh Mặn (category 4)
  { c: 4, n: 'Bánh mì que bơ đường', p: 12000, d: 'Que vàng ruộm, thơm bơ sữa, giòn rụm từng miếng.', b: 1 },
  { c: 4, n: 'Bánh mì phô mai tan chảy nhân thịt', p: 42000, d: 'Vỏ giòn, nhân thịt bằm sốt cà chua và phô mai mozzarella.', b: 1 },
  { c: 4, n: 'Bánh mì baguette mini', p: 15000, d: 'Baguette kiểu Pháp 25cm, vỏ giòn ruột xốp.', b: 0 },
  { c: 4, n: 'Bánh mì xíu mại sốt cà', p: 38000, d: 'Ổ mì mềm kẹp xíu mại nóng hổi, rắc hành lá.', b: 1 },
  { c: 4, n: 'Bánh mì chà bông trứng muối', p: 32000, d: 'Nhân chà bông homemade, trứng muối bùi bùi.', b: 1 },
  { c: 4, n: 'Bánh mì than tre nhân phô mai', p: 28000, d: 'Màu than đặc trưng, ruột phô mai kem mặn ngọt.', b: 0 },
  { c: 4, n: 'Croissant bơ lạt', p: 25000, d: 'Lớp lá bơ rõ, hương bơ Pháp chuẩn tiệm.', b: 1 },
  { c: 4, n: 'Croissant socola nhân hazelnut', p: 32000, d: 'Ruột socola đắng nhẹ, phủ hạt dẻ cười.', b: 1 },
  { c: 4, n: 'Pain au chocolat', p: 30000, d: 'Bánh sừng bò Pháp kẹp thanh socola đen.', b: 0 },
  { c: 4, n: 'Bánh mì dừa nướng', p: 18000, d: 'Vị dừa nạo và sữa đặc, mặt bánh bóng vàng.', b: 0 },
  { c: 4, n: 'Bánh mì hoa cúc nhân custard', p: 22000, d: 'Hình cúc vàng, nhân custard trứng sữa mịn.', b: 1 },
  { c: 4, n: 'Bánh mì gối kem trứng muối', p: 35000, d: 'Vỏ mềm, kem trứng muối tan chảy giữa ổ.', b: 1 },
  { c: 4, n: 'Focaccia ôliu rosemary', p: 45000, d: 'Dầu ôliu extra virgin, lá hương thảo tươi.', b: 0 },
  { c: 4, n: 'Bánh mì đen than tre tỏi', p: 26000, d: 'Màu đen tự nhiên từ than tre, tỏi phi thơm.', b: 0 },
  { c: 4, n: 'Bánh bao kim sa trứng muối', p: 28000, d: 'Vỏ mềm, nhân trứng muối chảy vàng óng.', b: 1 },
  { c: 4, n: 'Bánh bao nhân thịt gà nấm', p: 24000, d: 'Thịt gà xé sợi xào nấm đông cô đậm vị.', b: 0 },
  { c: 4, n: 'Bánh mì sandwich tôm sốt mayo', p: 48000, d: 'Tôm sú tươi, sốt mayo chanh, rau xà lách.', b: 0 },
  // Bánh Ngọt (category 5)
  { c: 5, n: 'Bánh flan caramel cốt dừa', p: 18000, d: 'Flan mềm tan, nước caramel đắng nhẹ, topping cốt dừa.', b: 1 },
  { c: 5, n: 'Bánh chuối nướng walnut', p: 22000, d: 'Chuối chín mọng, hạt óc chó rang, ít đường thốt nốt.', b: 1 },
  { c: 5, n: 'Bánh mochi kem matcha', p: 35000, d: 'Vỏ dẻo mochi Nhật, nhân kem matcha Uji.', b: 1 },
  { c: 5, n: 'Bánh tiramisu ly cá nhân', p: 45000, d: 'Mascarpone Ý, cà phê espresso, bột cacao.', b: 1 },
  { c: 5, n: 'Bánh red velvet cupcake', p: 28000, d: 'Cupcake đỏ cổ điển, kem phô mai chua ngọt.', b: 0 },
  { c: 5, n: 'Macaron hộp 6 vị', p: 120000, d: 'Dâu, chanh, socola, pistachio, vanilla, cà phê.', b: 1 },
  { c: 5, n: 'Bánh opera lát', p: 55000, d: 'Lớp bánh almond, coffee buttercream, ganache.', b: 0 },
  { c: 5, n: 'Éclair socola Pháp', p: 32000, d: 'Vỏ choux giòn, nhân pastry cream socola Bỉ.', b: 1 },
  { c: 5, n: 'Bánh crepe sầu riêng', p: 65000, d: 'Crepe mỏng kẹp kem sầu riêng Ri6.', b: 1 },
  { c: 5, n: 'Bánh panna cotta dâu tây', p: 38000, d: 'Panna cotta sữa tươi, sốt dâu tây Đà Lạt.', b: 0 },
  { c: 5, n: 'Cheesecake New York cắt', p: 48000, d: 'Phô mai kem đặc, đế bánh quy bơ.', b: 1 },
  { c: 5, n: 'Bánh brownie socola đen', p: 35000, d: 'Socola 70%, hạt dẻ, ẩm và dính miệng.', b: 0 },
  { c: 5, n: 'Lemon tart chanh vàng', p: 42000, d: 'Kem chanh chua ngọt cân bằng, đế tart giòn.', b: 1 },
  { c: 5, n: 'Bánh choux kem vanilla Madagascar', p: 26000, d: 'Choux tròn, kem vanilla hạt thật.', b: 0 },
  { c: 5, n: 'Kouign-amann bơ Brittany', p: 38000, d: 'Caramel bơ đường kiểu Bretagne, rất giòn.', b: 1 },
  { c: 5, n: 'Bánh donut sô cô la phủ', p: 22000, d: 'Donut yeast, phủ socola sữa và cốm màu.', b: 0 },
  { c: 5, n: 'Bánh cinnamon roll sốt phô mai', p: 30000, d: 'Quế Ceylon, cuộn mềm, sốt cream cheese.', b: 1 },
  { c: 5, n: 'Bánh mousse xoài chanh dây', p: 52000, d: 'Mousse xoài cát Hòa Lộc, lớp chanh dây.', b: 0 },
  // Bánh Kem (category 2)
  { c: 2, n: 'Bánh kem dâu tây tươi 16cm', p: 420000, d: 'Kem tươi Ý, dâu tây Đà Lạt xếp hoa.', b: 1 },
  { c: 2, n: 'Bánh kem chocolate ganache 18cm', p: 480000, d: 'Ganache socola đen 64%, cốt bánh ẩm.', b: 1 },
  { c: 2, n: 'Bánh kem oreo cookie crumble', p: 450000, d: 'Kem phô mai, bánh oreo vụn giòn xen kẽ.', b: 1 },
  { c: 2, n: 'Bánh kem trà Earl Grey mật ong', p: 440000, d: 'Kem infused trà bá tước, lớp mật ong nhẹ.', b: 0 },
  { c: 2, n: 'Bánh kem pistachio hạt dẻ', p: 520000, d: 'Kem pistachio Sicily, trang trí hạt dẻ cười.', b: 1 },
  { c: 2, n: 'Bánh kem tiramisu 20cm', p: 490000, d: 'Phiên bản bánh kem cao, lớp cà phê rõ.', b: 0 },
  { c: 2, n: 'Bánh kem red velvet 2 tầng', p: 680000, d: 'Hai tầng đỏ velvet, kem phô mai ổn định.', b: 1 },
  { c: 2, n: 'Bánh kem unicorn pastel', p: 550000, d: 'Màu pastel, sừng kẹo fondant, dành tiệc nhỏ.', b: 0 },
  { c: 2, n: 'Bánh kem rau câu 3D trái cây', p: 380000, d: 'Rau câu trong, nhân trái cây tươi cắt khối.', b: 0 },
  { c: 2, n: 'Bánh kem bơ sầu riêng 16cm', p: 580000, d: 'Cốt chiffon, kem sầu Ri6, mùi nồng đặc trưng.', b: 1 },
  { c: 2, n: 'Bánh kem cưới mini 2 tầng 15cm', p: 720000, d: 'Trắng ivory, hoa fondant, giao kèm topper.', b: 0 },
  { c: 2, n: 'Bánh kem cà phê phin cốt dừa', p: 430000, d: 'Kem cà phê phin VN, lớp cốt dừa béo.', b: 1 },
  { c: 2, n: 'Bánh kem hạnh nhân caramel muối', p: 460000, d: 'Caramel muối biển, hạnh nhân rang bơ.', b: 1 },
  { c: 2, n: 'Bánh kem yogurt việt quất', p: 410000, d: 'Kem yogurt Hy Lạp, việt quất nhập.', b: 0 },
  { c: 2, n: 'Bánh kem hoa hồng kem bơ', p: 650000, d: 'Piping hoa hồng kem bơ Swiss, nhiều màu.', b: 1 },
  { c: 2, n: 'Bánh kem sinh nhật số tuổi fondant', p: 520000, d: 'Fondant mỏng, số tuổi theo yêu cầu (ghi chú đơn).', b: 1 },
  { c: 2, n: 'Bánh kem matcha azuki đậu đỏ', p: 470000, d: 'Matcha Uji, lớp đậu đỏ Nhật ngọt dịu.', b: 0 },
  { c: 2, n: 'Bánh kem dừa non lá dứa', p: 440000, d: 'Cốt lá dứa xanh, kem dừa non Bến Tre.', b: 1 },
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

  const [[{ n }]] = await connection.query(
    'SELECT COUNT(*) AS n FROM Products WHERE deleted_at IS NULL'
  );
  if (Number(n) >= 50) {
    console.log(`Đã có ${n} sản phẩm — bỏ qua seed (xóa thủ công nếu muốn chạy lại).`);
    await connection.end();
    process.exit(0);
  }

  console.log(`Đang thêm ${CATALOG.length} sản phẩm mẫu...`);
  let added = 0;
  for (let i = 0; i < CATALOG.length; i++) {
    const row = CATALOG[i];
    const img = IMAGES[i % IMAGES.length];
    const best = row.b ? 1 : 0;
    const [ins] = await connection.execute(
      'INSERT INTO Products (category_id, name, base_price, description, is_best_seller) VALUES (?, ?, ?, ?, ?)',
      [row.c, row.n, row.p, row.d, best]
    );
    const pid = ins.insertId;
    await connection.execute(
      'INSERT INTO Product_Images (product_id, image_url, is_thumbnail) VALUES (?, ?, TRUE)',
      [pid, img]
    );
    const stock = 20 + (i % 40) * 2;
    await connection.execute(
      'INSERT INTO Product_Variants (product_id, sku, size_name, price_adjustment, stock_quantity) VALUES (?, ?, ?, 0, ?)',
      [pid, `SKU-${pid}-DF`, 'Mặc định', stock]
    );
    added += 1;
  }

  console.log(`Hoàn tất: đã thêm ${added} sản phẩm.`);
  await connection.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
