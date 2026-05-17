const db = require('../config/db');
require('dotenv').config();

const categories = [
  { id: 1, name: 'Siêu Phẩm Trending', description: 'Những cái tên đang dẫn đầu xu hướng bánh ngọt 2024-2025' },
  { id: 2, name: 'Bánh Mì Nghệ Nhân', description: 'Được nhào nặn thủ công từ men rừng tự nhiên' },
  { id: 3, name: 'Túi Quà Gourmet', description: 'Macarons và Cookies cao cấp cho những dịp đặc biệt' },
  { id: 4, name: 'Tráng Miệng Pháp', description: 'Sự tinh tế trong từng lớp kem mousse và trang trí' }
];

const products = [
  // Trending 2024-2025 - ALL IMAGES VERIFIED
  { category_id: 1, name: 'Basque Burnt Cheesecake Ý', price: 125000, best: 1, img: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800', desc: 'Bánh phô mai nướng cháy với kết cấu tan chảy, béo ngậy đầy mê hoặc.' },
  { category_id: 1, name: 'Bông Lan Trứng Muối Lava', price: 85000, best: 1, img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800', desc: 'Cốt bánh mềm xốp kết hợp sốt lava trứng muối chảy và chà bông thượng hạng.' },
  { category_id: 1, name: 'Signature Matcha Tiramisu', price: 75000, best: 1, img: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800', desc: 'Biến tấu thanh tao với bột trà xanh Uji và kem Mascarpone mượt mà.' },
  { category_id: 1, name: 'Dâu Tây Croffle Thượng Hạng', price: 55000, best: 1, img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800', desc: 'Sự giao thoa hoàn hảo giữa Croissant và Waffle, giòn tan bên ngoài, mềm dai bên trong.' },

  // Artisan Breads
  { category_id: 2, name: 'Croissant Bơ Pháp AOP', price: 45000, best: 1, img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800', desc: 'Từng lớp bánh giòn rụm với hương bơ vùng Charentes-Poitou danh tiếng.' },
  { category_id: 2, name: 'Sourdough Nguyên Cám 48h', price: 95000, best: 0, img: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=800', desc: 'Lên men tự nhiên 48 giờ, vỏ giòn ruột ẩm, tốt cho sức khỏe.' },
  { category_id: 2, name: 'Bánh Mì Bơ Tỏi Phô Mai', price: 65000, best: 1, img: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800', desc: 'Sốt kem phô mai tràn trề và hương bơ tỏi nồng nàn từ lò nướng.' },

  // Gourmet Gifts
  { category_id: 3, name: 'Hộp Macarons "Parisian Dream"', price: 280000, best: 1, img: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=800', desc: 'Bộ sưu tập 12 vị macarons đặc trưng mang cả Paris về nhà bạn.' },
  { category_id: 3, name: 'Cookies Hạnh Nhân Ngói Diệp', price: 145000, best: 1, img: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800', desc: 'Mỏng tan như lá lúa, giòn rụm với 100% hạnh nhân lát lát.' }
];

async function seed() {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Total Reset
    const tables = ['Product_Variants', 'Product_Images', 'Wishlists', 'Order_Items', 'Cart_Items', 'Reviews', 'Products', 'Categories'];
    for (const table of tables) {
      await connection.query(`TRUNCATE TABLE ${table}`);
    }
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('--- SEEDING PREMIUM CATEGORIES ---');
    for (const cat of categories) {
      await connection.query('INSERT INTO Categories (id, name, description, is_active) VALUES (?, ?, ?, 1)', 
        [cat.id, cat.name, cat.description]);
    }

    console.log('\n--- SEEDING 2024-2025 TRENDING PRODUCTS ---');
    for (const p of products) {
      const [result] = await connection.query(
        'INSERT INTO Products (category_id, name, base_price, description, is_best_seller) VALUES (?, ?, ?, ?, ?)',
        [p.category_id, p.name, p.price, p.desc, p.best]
      );
      
      const productId = result.insertId;
      await connection.query(
        'INSERT INTO Product_Images (product_id, image_url, is_thumbnail) VALUES (?, ?, 1)',
        [productId, p.img, 1]
      );
      
      await connection.query(
        'INSERT INTO Product_Variants (product_id, sku, size_name, price_adjustment, stock_quantity) VALUES (?, ?, ?, ?, ?)',
        [productId, `PREMIUM-${productId}`, 'Signature Original', 0, 100]
      );
      console.log(`  ✓ Added Premium Product: ${p.name}`);
    }
    
    await connection.commit();
    console.log('\n🚀 PREMIUM ARTISAN CATALOG IS NOW LIVE!');
  } catch (err) {
    await connection.rollback();
    console.error('❌ Seeding failed:', err);
  } finally {
    connection.release();
    process.exit(0);
  }
}

seed();
