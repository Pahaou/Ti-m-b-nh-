ALTER TABLE Coupons
    ADD COLUMN max_discount_amount DECIMAL(12,2) DEFAULT NULL
    COMMENT 'Giới hạn tối đa cho coupon phần trăm (NULL = không giới hạn)';
