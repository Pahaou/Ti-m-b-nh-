/**
 * Hoàn tồn kho cho tất cả dòng Order_Items của một đơn (dùng trong transaction).
 */
async function restoreStockForOrder(conn, orderId) {
    const [items] = await conn.execute('SELECT variant_id, quantity FROM Order_Items WHERE order_id = ?', [orderId]);
    for (const item of items) {
        if (item.variant_id) {
            await conn.execute(
                'UPDATE Product_Variants SET stock_quantity = stock_quantity + ? WHERE id = ?',
                [item.quantity, item.variant_id]
            );
        }
    }
}

module.exports = { restoreStockForOrder };
