-- Danh mục hàng bị lỗi / thanh lý
ALTER TABLE Categories
    ADD COLUMN is_defect BOOLEAN NOT NULL DEFAULT FALSE AFTER is_active;

INSERT INTO Categories (name, description, image, is_active, is_defect)
SELECT 'Hàng bị lỗi',
       'Bánh còn hạn sử dụng nhưng không đạt chuẩn trưng bày — giảm giá thanh lý',
       'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&q=80',
       TRUE,
       TRUE
WHERE NOT EXISTS (SELECT 1 FROM Categories WHERE is_defect = TRUE);
