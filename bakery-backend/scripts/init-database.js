/**
 * 🎂 INIT DATABASE - Tạo 18 bảng mới trên Aiven MySQL
 * Script XÓA toàn bộ bảng liên quan rồi tạo lại + seed.
 * Chỉ chạy khi chủ động reset: ALLOW_DB_RESET=true node init-database.js
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initDatabase() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false },
            multipleStatements: true
        });

        console.log('✅ Đã kết nối Aiven thành công!\n');

        // ==========================================
        // 1. XÓA BẢNG CŨ
        // ==========================================
        console.log('🗑️  Đang xóa các bảng cũ...');
        await connection.query(`
            SET FOREIGN_KEY_CHECKS = 0;
            DROP TABLE IF EXISTS Role_Permissions;
            DROP TABLE IF EXISTS Permissions;
            DROP TABLE IF EXISTS Reviews;
            DROP TABLE IF EXISTS Payments;
            DROP TABLE IF EXISTS Order_Items;
            DROP TABLE IF EXISTS Orders;
            DROP TABLE IF EXISTS Cart_Items;
            DROP TABLE IF EXISTS Carts;
            DROP TABLE IF EXISTS Coupons;
            DROP TABLE IF EXISTS Product_Variants;
            DROP TABLE IF EXISTS Product_Images;
            DROP TABLE IF EXISTS Wishlists;
            DROP TABLE IF EXISTS Products;
            DROP TABLE IF EXISTS Categories;
            DROP TABLE IF EXISTS User_Addresses;
            DROP TABLE IF EXISTS Users;
            DROP TABLE IF EXISTS Roles;
            DROP TABLE IF EXISTS Banners;
            DROP TABLE IF EXISTS Notifications;
            SET FOREIGN_KEY_CHECKS = 1;
        `);
        console.log('✅ Đã xóa bảng cũ!\n');

        // ==========================================
        // 2. TẠO 18 BẢNG MỚI
        // ==========================================
        console.log('🏗️  Đang tạo 18 bảng mới...');

        // --- RBAC ---
        await connection.query(`
            CREATE TABLE Roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                role_name VARCHAR(50) UNIQUE NOT NULL,
                description VARCHAR(255)
            )
        `);
        console.log('  ✓ Roles');

        await connection.query(`
            CREATE TABLE Permissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                permission_name VARCHAR(100) UNIQUE NOT NULL,
                description VARCHAR(255)
            )
        `);
        console.log('  ✓ Permissions');

        await connection.query(`
            CREATE TABLE Role_Permissions (
                role_id INT NOT NULL,
                permission_id INT NOT NULL,
                PRIMARY KEY (role_id, permission_id),
                FOREIGN KEY (role_id) REFERENCES Roles(id) ON DELETE CASCADE,
                FOREIGN KEY (permission_id) REFERENCES Permissions(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✓ Role_Permissions');

        // --- USERS ---
        await connection.query(`
            CREATE TABLE Users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                role_id INT NOT NULL,
                fullname VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(15),
                loyalty_points INT DEFAULT 0,
                total_spent DECIMAL(10, 2) DEFAULT 0,
                membership_tier ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL,
                FOREIGN KEY (role_id) REFERENCES Roles(id)
            )
        `);
        console.log('  ✓ Users');

        await connection.query(`
            CREATE TABLE User_Addresses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                receiver_name VARCHAR(100) NOT NULL,
                receiver_phone VARCHAR(15) NOT NULL,
                address_detail TEXT NOT NULL,
                is_default BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✓ User_Addresses');

        await connection.query(`
            CREATE TABLE Notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type ENUM('order', 'promo', 'system') DEFAULT 'system',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✓ Notifications');

        // --- PRODUCTS ---
        await connection.query(`
            CREATE TABLE Categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                image VARCHAR(500),
                is_active BOOLEAN DEFAULT TRUE,
                is_defect BOOLEAN NOT NULL DEFAULT FALSE
            )
        `);
        console.log('  ✓ Categories');

        await connection.query(`
            CREATE TABLE Products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                base_price DECIMAL(10, 2) NOT NULL,
                description TEXT,
                is_best_seller BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL,
                FOREIGN KEY (category_id) REFERENCES Categories(id)
            )
        `);
        console.log('  ✓ Products');

        await connection.query(`
            CREATE TABLE Product_Images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                is_thumbnail BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✓ Product_Images');

        await connection.query(`
            CREATE TABLE Product_Variants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                sku VARCHAR(50) UNIQUE,
                size_name VARCHAR(50) NOT NULL,
                price_adjustment DECIMAL(10, 2) DEFAULT 0,
                stock_quantity INT NOT NULL DEFAULT 0,
                FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✓ Product_Variants');

        // --- WISHLISTS & REVIEWS ---
        await connection.query(`
            CREATE TABLE Wishlists (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE,
                UNIQUE(user_id, product_id)
            )
        `);
        console.log('  ✓ Wishlists');

        await connection.query(`
            CREATE TABLE Reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                rating INT CHECK(rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id),
                FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✓ Reviews');

        // --- MARKETING ---
        await connection.query(`
            CREATE TABLE Coupons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                discount_type ENUM('percent', 'fixed') NOT NULL,
                discount_value DECIMAL(10, 2) NOT NULL,
                min_order_value DECIMAL(10, 2) DEFAULT 0,
                max_discount_amount DECIMAL(10, 2) DEFAULT NULL,
                usage_limit INT DEFAULT 100,
                used_count INT DEFAULT 0,
                valid_from DATETIME,
                valid_until DATETIME,
                is_active BOOLEAN DEFAULT TRUE
            )
        `);
        console.log('  ✓ Coupons');

        await connection.query(`
            CREATE TABLE Banners (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(100),
                image_url VARCHAR(500) NOT NULL,
                target_link VARCHAR(255),
                position INT DEFAULT 1,
                is_active BOOLEAN DEFAULT TRUE
            )
        `);
        console.log('  ✓ Banners');

        // --- CART ---
        await connection.query(`
            CREATE TABLE Carts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✓ Carts');

        await connection.query(`
            CREATE TABLE Cart_Items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                cart_id INT NOT NULL,
                product_id INT NOT NULL,
                variant_id INT NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                FOREIGN KEY (cart_id) REFERENCES Carts(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE,
                FOREIGN KEY (variant_id) REFERENCES Product_Variants(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✓ Cart_Items');

        // --- ORDERS ---
        await connection.query(`
            CREATE TABLE Orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                coupon_id INT NULL,
                total_amount DECIMAL(10, 2) NOT NULL,
                shipping_fee DECIMAL(10, 2) DEFAULT 0,
                discount_amount DECIMAL(10, 2) DEFAULT 0,
                final_amount DECIMAL(10, 2) NOT NULL,
                shipping_address TEXT NOT NULL,
                customer_note TEXT,
                status ENUM('pending', 'confirmed', 'baking', 'shipping', 'completed', 'cancelled') DEFAULT 'pending',
                order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id),
                FOREIGN KEY (coupon_id) REFERENCES Coupons(id) ON DELETE SET NULL
            )
        `);
        console.log('  ✓ Orders');

        await connection.query(`
            CREATE TABLE Order_Items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                variant_id INT,
                quantity INT NOT NULL,
                unit_price DECIMAL(10, 2) NOT NULL,
                item_note VARCHAR(255),
                FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES Products(id),
                FOREIGN KEY (variant_id) REFERENCES Product_Variants(id) ON DELETE SET NULL
            )
        `);
        console.log('  ✓ Order_Items');

        await connection.query(`
            CREATE TABLE Payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                payment_method ENUM('COD', 'VNPay', 'MoMo') DEFAULT 'COD',
                payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
                transaction_id VARCHAR(100),
                paid_at TIMESTAMP NULL,
                FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✓ Payments');

        console.log('\n✅ Đã tạo xong 18 bảng!\n');

        // ==========================================
        // 3. CHÈN DỮ LIỆU MẪU
        // ==========================================
        console.log('📦 Đang chèn dữ liệu mẫu...');

        // Roles
        await connection.query(`
            INSERT INTO Roles (role_name, description) VALUES 
            ('admin', 'Quản trị viên hệ thống'),
            ('staff', 'Nhân viên cửa hàng'),
            ('customer', 'Khách hàng')
        `);
        console.log('  ✓ Roles (3)');

        // Permissions
        await connection.query(`
            INSERT INTO Permissions (permission_name, description) VALUES 
            ('VIEW_DASHBOARD', 'Xem biểu đồ thống kê'),
            ('MANAGE_USERS', 'Quản lý tài khoản'),
            ('MANAGE_PRODUCTS', 'Thêm sửa xóa bánh'),
            ('MANAGE_ORDERS', 'Duyệt và cập nhật đơn hàng')
        `);
        console.log('  ✓ Permissions (4)');

        // Role_Permissions
        await connection.query(`
            INSERT INTO Role_Permissions (role_id, permission_id) VALUES 
            (1, 1), (1, 2), (1, 3), (1, 4),
            (2, 1), (2, 4)
        `);
        console.log('  ✓ Role_Permissions');

        // Users (mật khẩu đã băm bcrypt)
        const adminPass = await bcrypt.hash('admin123', 10);
        const staffPass = await bcrypt.hash('staff123', 10);
        const khachPass = await bcrypt.hash('khach123', 10);

        await connection.query(`
            INSERT INTO Users (role_id, fullname, email, password, phone) VALUES 
            (1, 'Sếp Tổng', 'admin@bakery.com', ?, '0901234567'),
            (2, 'Nhân Viên Nướng Bánh', 'staff@bakery.com', ?, '0909998887'),
            (3, 'Nguyễn Văn Khách', 'khachhang@gmail.com', ?, '0987654321')
        `, [adminPass, staffPass, khachPass]);
        console.log('  ✓ Users (3) - mật khẩu đã băm bcrypt');

        // User_Addresses
        await connection.query(`
            INSERT INTO User_Addresses (user_id, receiver_name, receiver_phone, address_detail, is_default) VALUES
            (3, 'Nguyễn Văn Khách', '0987654321', '123 Đường Lê Lợi, Quận 1, TP.HCM', TRUE)
        `);
        console.log('  ✓ User_Addresses (1)');

        // Categories
        await connection.query(`
            INSERT INTO Categories (name, description, image) VALUES 
            ('Bánh Mousse', 'Mousse mềm mịn, vị thanh nhẹ, nhiều lớp hương vị tinh tế', 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=200&q=80'),
            ('Bánh Kem', 'Bánh kem bắp, bánh kem truyền thống và các món đặc biệt', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&q=80'),
            ('CupCake', 'Cupcake mini xinh xắn, trang trí sáng tạo, phù hợp tiệc nhỏ', 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=200&q=80'),
            ('Bánh Mì và Bánh Mặn', 'Bánh mì nướng, bánh bao và các loại thức ăn mặn sảng khoái', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80'),
            ('Bánh Ngọt', 'Các loại bánh ngọt truyền thống đậm chất Việt', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&q=80'),
            ('COMBO Tiết Kiệm', 'Set bánh combo giá ưu đãi, tiết kiệm hơn khi mua theo set', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&q=80'),
            ('Hàng bị lỗi', 'Bánh còn hạn nhưng không đạt chuẩn trưng bày — giảm giá thanh lý', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&q=80')
        `);
        await connection.query(`
            UPDATE Categories SET is_defect = TRUE WHERE name = 'Hàng bị lỗi'
        `);
        console.log('  ✓ Categories (7, gồm Hàng bị lỗi)');

        // Products (10 sản phẩm)
        await connection.query(`
            INSERT INTO Products (category_id, name, base_price, description, is_best_seller) VALUES 
            (2, 'Bánh Kem Bắp Non Đặc Biệt', 380000, 'Bánh kem bắp thơm lừng, cốt bánh mềm mịn với hạt bắp non ngọt thanh và kem tươi béo ngậy.', TRUE),
            (2, 'Bánh Kem Sữa Tươi Trái Cây', 350000, 'Bánh kem sữa tươi phủ trái cây tươi nhiệt đới cho ngày hè rực rỡ.', TRUE),
            (4, 'Bánh Mì Thịt Nướng Đặc Biệt', 35000, 'Bánh mì giòn rụm với thịt nướng thơm nức, đồ chua và nước sốt bí truyền của HXH.', TRUE),
            (2, 'Bánh Kem Matcha Trà Xanh', 400000, 'Hương vị trà xanh Nhật Bản kết hợp cùng kem tươi thanh khiết.', FALSE),
            (5, 'Bánh Da Lợn Cốt Dừa', 15000, 'Bánh da lợn nhiều lớp màu sắc, thơm mùi lá dứa và nước cốt dừa béo ngậy.', TRUE),
            (4, 'Bánh Bao Nhân Thịt Trứng Muối', 25000, 'Bánh bao trắng ngần, nhân thịt băm đậm đà cùng trứng muối vàng ruộm.', FALSE),
            (5, 'Bánh Bò Thốt Nốt An Giang', 20000, 'Bánh bò thốt nốt ngọt thanh, xốp mềm với mùi thơm đặc trưng của đường thốt nốt.', TRUE),
            (5, 'Bánh Su Kem Vani Đà Lạt', 15000, 'Vỏ bánh mỏng giòn, nhân kem vani mát lạnh, ngọt dịu tan trong miệng.', FALSE),
            (4, 'Bánh Mì Bơ Tỏi Phô Mai', 45000, 'Bánh mì nướng giòn with bơ tỏi thơm lừng và phô mai kéo sợi hấp dẫn.', TRUE),
            (4, 'Bánh Mì Phô Mai Tan Chảy', 55000, 'Bánh mì mềm mịn với lớp phô mai béo ngậy tràn ra khi bẻ bánh.', FALSE)
        `);
        console.log('  ✓ Products (10)');

        // Product_Images
        await connection.query(`
            INSERT INTO Product_Images (product_id, image_url, is_thumbnail) VALUES
            (1, 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=600', TRUE),
            (2, 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600', TRUE),
            (3, 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600', TRUE),
            (4, 'https://images.unsplash.com/photo-1542849964-550df98b9272?w=600', TRUE),
            (5, 'https://images.unsplash.com/photo-1610632380980-456079975765?w=600', TRUE),
            (6, 'https://images.unsplash.com/photo-1621213143723-2736239bc341?w=600', TRUE),
            (7, 'https://images.unsplash.com/photo-1534422298391-e4f8c170db06?w=600', TRUE),
            (8, 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=600', TRUE),
            (9, 'https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=600', TRUE),
            (10, 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=600', TRUE)
        `);
        console.log('  ✓ Product_Images (10)');

        // Product_Variants
        await connection.query(`
            INSERT INTO Product_Variants (product_id, sku, size_name, price_adjustment, stock_quantity) VALUES 
            (8, 'ECLAIR-1', '1 Chiếc', 0, 30),
            (8, 'ECLAIR-3', 'Set 3 Chiếc', 100000, 15),
            (9, 'GARLIC-1', '1 Ổ', 0, 50),
            (10, 'CROIS-1', '1 Chiếc', 0, 40),
            (10, 'CROIS-3', 'Set 3 Chiếc', 80000, 20)
        `);
        console.log('  ✓ Product_Variants (20)');

        // Coupons
        await connection.query(`
            INSERT INTO Coupons (code, discount_type, discount_value, min_order_value, valid_from, valid_until) VALUES
            ('WELCOME10', 'percent', 10.00, 200000, '2026-01-01', '2026-12-31'),
            ('GIAM50K', 'fixed', 50000, 300000, '2026-01-01', '2026-12-31'),
            ('SINHCNHAT', 'percent', 15.00, 500000, '2026-01-01', '2026-12-31')
        `);
        console.log('  ✓ Coupons (3)');

        // Banners
        await connection.query(`
            INSERT INTO Banners (title, image_url, target_link, position) VALUES
            ('Bánh Kem Mùa Hè', 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=1200', '/', 1),
            ('Khuyến Mãi 10%', 'https://images.unsplash.com/photo-1486427944544-d2c246c4df8a?w=1200', '/', 2)
        `);
        console.log('  ✓ Banners (2)');

        // Wishlist mẫu
        await connection.query(`
            INSERT INTO Wishlists (user_id, product_id) VALUES (3, 1), (3, 5)
        `);
        console.log('  ✓ Wishlists (2)');

        // Đơn hàng mẫu
        await connection.query(`
            INSERT INTO Orders (user_id, coupon_id, total_amount, shipping_fee, discount_amount, final_amount, shipping_address, customer_note, status) VALUES
            (3, 1, 450000, 30000, 45000, 435000, '123 Đường Lê Lợi, Quận 1, TP.HCM', 'Giao trước 5h chiều nha shop', 'confirmed')
        `);
        console.log('  ✓ Orders (1)');

        await connection.query(`
            INSERT INTO Order_Items (order_id, product_id, variant_id, quantity, unit_price, item_note) VALUES
            (1, 1, 2, 1, 450000, 'Viết chữ: Happy Birthday')
        `);
        console.log('  ✓ Order_Items (1)');

        await connection.query(`
            INSERT INTO Payments (order_id, payment_method, payment_status) VALUES
            (1, 'COD', 'unpaid')
        `);
        console.log('  ✓ Payments (1)');

        await connection.query(`
            INSERT INTO Reviews (user_id, product_id, rating, comment) VALUES
            (3, 1, 5, 'Bánh rất ngon, dâu tây tươi và kem không bị ngán!'),
            (3, 5, 4, 'Tiramisu đúng vị Ý, cà phê thơm. Ship nhanh!')
        `);
        console.log('  ✓ Reviews (2)');

        // Verify
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`\n🎉 HOÀN TẤT! Đã tạo ${tables.length} bảng trên Aiven!`);
        console.log('📋 Danh sách bảng:', tables.map(t => Object.values(t)[0]).join(', '));
        
        console.log('\n📝 Tài khoản mẫu:');
        console.log('   Admin:    admin@bakery.com / admin123');
        console.log('   Staff:    staff@bakery.com / staff123');
        console.log('   Khách:    khachhang@gmail.com / khach123');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}

if (process.env.ALLOW_DB_RESET !== 'true') {
    console.error('⚠️  init-database.js sẽ XÓA và tạo lại schema. Để chạy, set biến môi trường ALLOW_DB_RESET=true');
    process.exit(1);
}

initDatabase();
