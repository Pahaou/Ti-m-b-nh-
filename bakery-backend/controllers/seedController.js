const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// Dữ liệu mô phỏng từ Kaggle Bakery Datasets - Mở rộng lên 25+ sản phẩm
const KAGGLE_BAKERY_DATA = [
    // --- Bánh Mì (category_id: 1) ---
    {
        name: 'Bánh Mì Baguette Truyền Thống',
        category_id: 1,
        base_price: 25000,
        description: 'Bánh mì Baguette kiểu Pháp với lớp vỏ giòn tan và ruột mềm xốp.',
        image_url: 'https://images.unsplash.com/photo-1597079910443-60c43fc4f729?q=80&w=800',
        variants: [{ size_name: 'Ổ tiêu chuẩn', price_adjustment: 0, stock_quantity: 50 }]
    },
    {
        name: 'Bánh Mì Sourdough Men Tự Nhiên',
        category_id: 1,
        base_price: 95000,
        description: 'Bánh mì ủ men tự nhiên 24h, vỏ dày dai và vị chua nhẹ đặc trưng.',
        image_url: 'https://images.unsplash.com/photo-1585478259715-876a6a81fc08?q=80&w=800',
        variants: [{ size_name: 'Ổ 500g', price_adjustment: 0, stock_quantity: 15 }]
    },
    {
        name: 'Bánh Mì Hoa Cúc Brioche',
        category_id: 1,
        base_price: 85000,
        description: 'Bánh mì bơ cao cấp, mềm mịn như bông, thơm nồng hương bơ trứng.',
        image_url: 'https://images.unsplash.com/photo-1601208443914-3b2c4ca4a98a?q=80&w=800',
        variants: [{ size_name: 'Ổ 300g', price_adjustment: 0, stock_quantity: 20 }]
    },
    {
        name: 'Bánh Mì Đen Nguyên Cám',
        category_id: 1,
        base_price: 65000,
        description: 'Lựa chọn lành mạnh cho chế độ ăn kiêng, giàu chất xơ và vitamin.',
        image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=800',
        variants: [{ size_name: 'Ổ 400g', price_adjustment: 0, stock_quantity: 30 }]
    },
    {
        name: 'Bánh Mì Ciabatta Ý',
        category_id: 1,
        base_price: 35000,
        description: 'Bánh mì Ý với lỗ khí lớn, vỏ mỏng giòn, tuyệt vời cho sandwich.',
        image_url: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?q=80&w=800',
        variants: [{ size_name: 'Cái lớn', price_adjustment: 0, stock_quantity: 40 }]
    },

    // --- Bánh Ngọt (category_id: 2) ---
    {
        name: 'Croissant Bơ Pháp',
        category_id: 2,
        base_price: 35000,
        description: 'Bánh sừng bò ngàn lớp thơm lừng hương bơ, giòn tan bên ngoài.',
        image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800',
        variants: [{ size_name: 'Mặc định', price_adjustment: 0, stock_quantity: 40 }]
    },
    {
        name: 'Pain au Chocolat',
        category_id: 2,
        base_price: 40000,
        description: 'Sự kết hợp hoàn hảo giữa bột bánh ngàn lớp và nhân socola đen.',
        image_url: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?q=80&w=800',
        variants: [{ size_name: 'Mặc định', price_adjustment: 0, stock_quantity: 35 }]
    },
    {
        name: 'Bánh Tart Trứng Hong Kong',
        category_id: 2,
        base_price: 15000,
        description: 'Lớp vỏ ngàn lớp giòn rụm bao bọc nhân trứng sữa béo ngậy.',
        image_url: 'https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?q=80&w=800',
        variants: [{ size_name: 'Cái nhỏ', price_adjustment: 0, stock_quantity: 100 }]
    },
    {
        name: 'Cookie Socola Chip Khổng Lồ',
        category_id: 2,
        base_price: 25000,
        description: 'Bánh quy mềm kiểu Mỹ với lượng socola chip dày đặc.',
        image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800',
        variants: [{ size_name: 'Cái lớn', price_adjustment: 0, stock_quantity: 60 }]
    },
    {
        name: 'Muffin Việt Quất',
        category_id: 2,
        base_price: 30000,
        description: 'Bánh muffin ẩm mượt với những quả việt quất tươi mọng nước.',
        image_url: 'https://images.unsplash.com/photo-1558303420-f814d8a590f5?q=80&w=800',
        variants: [{ size_name: 'Cái vừa', price_adjustment: 0, stock_quantity: 45 }]
    },
    {
        name: 'Donut Dâu Tây Phủ Đường',
        category_id: 2,
        base_price: 20000,
        description: 'Bánh vòng chiên vàng, phủ lớp kem dâu tây hồng ngọt ngào.',
        image_url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=800',
        variants: [{ size_name: 'Cái', price_adjustment: 0, stock_quantity: 50 }]
    },
    {
        name: 'Macarons Pháp (Sét 6 vị)',
        category_id: 2,
        base_price: 120000,
        description: 'Bánh Macaron tinh tế nhiều màu sắc và hương vị từ Paris.',
        image_url: 'https://images.unsplash.com/photo-1569864358642-9d16197022c3?q=80&w=800',
        variants: [{ size_name: 'Hộp 6 viên', price_adjustment: 0, stock_quantity: 20 }]
    },

    // --- Bánh Kem (category_id: 3) ---
    {
        name: 'Bánh Kem Red Velvet',
        category_id: 3,
        base_price: 450000,
        description: 'Sắc đỏ nhung quý phái quyện cùng kem cheese béo ngậy.',
        image_url: 'https://images.unsplash.com/photo-1586788680434-30d3246718d0?q=80&w=800',
        variants: [
            { size_name: '16cm', price_adjustment: 0, stock_quantity: 10 },
            { size_name: '20cm', price_adjustment: 150000, stock_quantity: 5 }
        ]
    },
    {
        name: 'Tiramisu Cổ Điển',
        category_id: 3,
        base_price: 380000,
        description: 'Hương vị cà phê nồng nàn kết hợp kem Mascarpone mịn màng.',
        image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=800',
        variants: [{ size_name: '16cm', price_adjustment: 0, stock_quantity: 10 }]
    },
    {
        name: 'Bánh Kem Bắp (Corn Cake)',
        category_id: 3,
        base_price: 420000,
        description: 'Vị ngọt thanh từ bắp Mỹ tươi, lớp kem nhẹ tênh không ngán.',
        image_url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=800',
        variants: [{ size_name: '16cm', price_adjustment: 0, stock_quantity: 8 }]
    },
    {
        name: 'Black Forest (Rừng Đen)',
        category_id: 3,
        base_price: 480000,
        description: 'Sự kết hợp giữa cốt bánh socola, anh đào rượu rum và kem tươi.',
        image_url: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=800',
        variants: [{ size_name: '20cm', price_adjustment: 0, stock_quantity: 5 }]
    },
    {
        name: 'Cheesecake Việt Quất',
        category_id: 3,
        base_price: 350000,
        description: 'Bánh phô mai nướng đậm đà, phủ sốt việt quất chua ngọt.',
        image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800',
        variants: [{ size_name: 'Ổ 16cm', price_adjustment: 0, stock_quantity: 12 }]
    },

    // --- Đồ Uống (category_id: 4) ---
    {
        name: 'Trà Đào Cam Sả',
        category_id: 4,
        base_price: 45000,
        description: 'Thức uống giải nhiệt sảng khoái với đào miếng và hương sả thơm.',
        image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800',
        variants: [{ size_name: 'Ly Lớn', price_adjustment: 0, stock_quantity: 200 }]
    },
    {
        name: 'Matcha Latte Đá Xay',
        category_id: 4,
        base_price: 55000,
        description: 'Matcha Nhật Bản nguyên chất với kem tươi béo ngậy.',
        image_url: 'https://images.unsplash.com/photo-1536304993881-ff6e9ecdee3d?q=80&w=800',
        variants: [{ size_name: 'Ly Vừa', price_adjustment: 0, stock_quantity: 150 }]
    },
    {
        name: 'Cà Phê Muối (Trend)',
        category_id: 4,
        base_price: 35000,
        description: 'Cà phê phin truyền thống kết hợp lớp kem mặn độc đáo.',
        image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800',
        variants: [{ size_name: 'Ly', price_adjustment: 0, stock_quantity: 300 }]
    },
    {
        name: 'Nước Ép Cam Tươi Nguyên Chất',
        category_id: 4,
        base_price: 40000,
        description: 'Cam tươi vắt trực tiếp, không đường hóa học, giàu Vitamin C.',
        image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=800',
        variants: [{ size_name: 'Chai 330ml', price_adjustment: 0, stock_quantity: 50 }]
    },
    {
        name: 'Sinh Tố Bơ Sáp',
        category_id: 4,
        base_price: 50000,
        description: 'Bơ sáp loại 1 xay cùng sữa đặc, béo ngậy và bổ dưỡng.',
        image_url: 'https://images.unsplash.com/photo-1543639062-8e10492cb705?q=80&w=800',
        variants: [{ size_name: 'Ly', price_adjustment: 0, stock_quantity: 40 }]
    },
    // --- Bổ sung thêm ---
    {
        name: 'Bánh Mì Gối Sữa',
        category_id: 1,
        base_price: 35000,
        description: 'Bánh mì gối mềm mịn, thơm mùi sữa, phù hợp cho bữa sáng gia đình.',
        image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800',
        variants: [{ size_name: 'Ổ 350g', price_adjustment: 0, stock_quantity: 40 }]
    },
    {
        name: 'Bánh Mì Ngũ Cốc Hạt Chia',
        category_id: 1,
        base_price: 55000,
        description: 'Bánh mì dinh dưỡng cao với các loại hạt ngũ cốc và hạt chia giòn bùi.',
        image_url: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?q=80&w=800',
        variants: [{ size_name: 'Ổ 400g', price_adjustment: 0, stock_quantity: 25 }]
    },
    {
        name: 'Cupcake Vanila Cầu Vồng',
        category_id: 2,
        base_price: 25000,
        description: 'Bánh cupcake vani mềm mịn với lớp kem trang trí sắc màu rực rỡ.',
        image_url: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?q=80&w=800',
        variants: [{ size_name: 'Cái nhỏ', price_adjustment: 0, stock_quantity: 60 }]
    },
    {
        name: 'Bánh Su Kem Phồng (Cream Puff)',
        category_id: 2,
        base_price: 12000,
        description: 'Vỏ bánh mỏng giòn bao bọc nhân kem vani mát lạnh, tan chảy.',
        image_url: 'https://images.unsplash.com/photo-1621236304845-8813dec9f13b?q=80&w=800',
        variants: [{ size_name: 'Cái', price_adjustment: 0, stock_quantity: 120 }]
    },
    {
        name: 'Pancake Mật Ong Trái Cây',
        category_id: 2,
        base_price: 65000,
        description: 'Bánh pancake áp chảo mềm xốp, dùng kèm mật ong và trái cây tươi.',
        image_url: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=800',
        variants: [{ size_name: 'Phần 3 cái', price_adjustment: 0, stock_quantity: 30 }]
    },
    {
        name: 'Bánh Kem Socola Ferrero',
        category_id: 3,
        base_price: 550000,
        description: 'Bánh kem socola đậm đà kết hợp hạt dẻ giòn và kẹo Ferrero Rocher.',
        image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800',
        variants: [
            { size_name: '16cm', price_adjustment: 0, stock_quantity: 5 },
            { size_name: '20cm', price_adjustment: 200000, stock_quantity: 3 }
        ]
    },
    {
        name: 'Bánh Kem Trái Cây Nhiệt Đới',
        category_id: 3,
        base_price: 400000,
        description: 'Bánh kem tươi nhẹ nhàng với lớp phủ trái cây nhiệt đới tươi mát.',
        image_url: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?q=80&w=800',
        variants: [{ size_name: '18cm', price_adjustment: 0, stock_quantity: 7 }]
    },
    {
        name: 'Trà Sữa Trân Châu Ô Long',
        category_id: 4,
        base_price: 45000,
        description: 'Trà ô long đậm vị quyện cùng sữa béo và trân châu đen dai giòn.',
        image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800',
        variants: [
            { size_name: 'Size M', price_adjustment: 0, stock_quantity: 200 },
            { size_name: 'Size L', price_adjustment: 10000, stock_quantity: 150 }
        ]
    },
    {
        name: 'Nước Ép Dưa Hấu Tươi',
        category_id: 4,
        base_price: 35000,
        description: 'Dưa hấu tươi mát, ngọt thanh, giàu vitamin và giải nhiệt tức thì.',
        image_url: 'https://images.unsplash.com/photo-1543158181-e6f9f670c5b5?q=80&w=800',
        variants: [{ size_name: 'Ly', price_adjustment: 0, stock_quantity: 100 }]
    },
    {
        name: 'Soda Việt Quất Bạc Hà',
        category_id: 4,
        base_price: 40000,
        description: 'Soda mát lạnh với siro việt quất và lá bạc hà tươi sảng khoái.',
        image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800',
        variants: [{ size_name: 'Ly', price_adjustment: 0, stock_quantity: 80 }]
    }
];

exports.seedKaggleData = asyncHandler(async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        console.log('🧹 Đang xóa dữ liệu cũ...');
        await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
        await conn.execute('DELETE FROM Product_Variants');
        await conn.execute('DELETE FROM Product_Images');
        await conn.execute('DELETE FROM Reviews');
        await conn.execute('DELETE FROM Wishlists');
        await conn.execute('DELETE FROM Cart_Items');
        await conn.execute('DELETE FROM Order_Items');
        await conn.execute('DELETE FROM Products');
        await conn.execute('SET FOREIGN_KEY_CHECKS = 1');

        console.log(`🌱 Đang nạp ${KAGGLE_BAKERY_DATA.length} sản phẩm Kaggle...`);

        for (const item of KAGGLE_BAKERY_DATA) {
            const [result] = await conn.execute(
                'INSERT INTO Products (category_id, name, base_price, description, is_best_seller) VALUES (?, ?, ?, ?, ?)',
                [item.category_id, item.name, item.base_price, item.description, Math.random() > 0.7]
            );
            const productId = result.insertId;

            await conn.execute(
                'INSERT INTO Product_Images (product_id, image_url, is_thumbnail) VALUES (?, ?, TRUE)',
                [productId, item.image_url]
            );

            for (const v of item.variants) {
                await conn.execute(
                    'INSERT INTO Product_Variants (product_id, sku, size_name, price_adjustment, stock_quantity) VALUES (?, ?, ?, ?, ?)',
                    [productId, `SKU-${productId}-${v.size_name.substring(0,2).toUpperCase()}`, v.size_name, v.price_adjustment, v.stock_quantity]
                );
            }
            
            if (Math.random() > 0.4) {
                 await conn.execute(
                    'INSERT INTO Reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
                    [1, productId, 4 + Math.round(Math.random()), 'Sản phẩm quá tuyệt vời, sẽ ủng hộ dài dài! ⭐⭐⭐⭐⭐']
                 );
            }
        }

        await conn.commit();
        res.json({ success: true, message: `Đã nạp thành công ${KAGGLE_BAKERY_DATA.length} sản phẩm thực tế từ Kaggle! 🚀` });
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
});
