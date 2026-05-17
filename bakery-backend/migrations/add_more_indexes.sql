-- More performance indexes for common queries
CREATE INDEX idx_products_category_id ON Products(category_id);
CREATE INDEX idx_products_deleted_at ON Products(deleted_at);
CREATE INDEX idx_product_variants_product_id ON Product_Variants(product_id);
CREATE INDEX idx_product_images_product_id ON Product_Images(product_id);
CREATE INDEX idx_coupons_code ON Coupons(code);
CREATE INDEX idx_notifications_user_id ON Notifications(user_id);
