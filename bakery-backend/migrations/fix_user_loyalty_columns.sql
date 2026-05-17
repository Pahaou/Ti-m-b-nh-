-- Migration to add loyalty columns if they are missing
-- This is safe to run even if columns exist

ALTER TABLE Users 
ADD COLUMN IF NOT EXISTS loyalty_points INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS membership_tier ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze';

-- Ensure values are not NULL
UPDATE Users SET loyalty_points = 0 WHERE loyalty_points IS NULL;
UPDATE Users SET total_spent = 0 WHERE total_spent IS NULL;
UPDATE Users SET membership_tier = 'bronze' WHERE membership_tier IS NULL;
