CREATE INDEX idx_orders_user_id    ON Orders(user_id);
CREATE INDEX idx_orders_status     ON Orders(status);
CREATE INDEX idx_cart_items_cart   ON Cart_Items(cart_id);
CREATE INDEX idx_reviews_product   ON Reviews(product_id);
CREATE INDEX idx_order_items_order ON Order_Items(order_id);
