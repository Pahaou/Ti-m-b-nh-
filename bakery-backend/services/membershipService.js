/**
 * Handle loyalty points and membership tier updates after a paid order.
 * Idempotent by order_id so online payment, admin confirmation, and completed
 * status cannot add points twice for the same order.
 */
async function processOrderLoyalty(conn, userId, orderId, amountPaid) {
    const [existing] = await conn.execute(
        'SELECT id FROM Point_History WHERE order_id = ? AND points > 0 LIMIT 1',
        [orderId]
    );
    if (existing.length > 0) {
        return { points: 0, alreadyProcessed: true };
    }

    const points = Math.floor(Number(amountPaid) / 10000);
    if (points <= 0) {
        return { points: 0, alreadyProcessed: false };
    }

    await conn.execute(
        `UPDATE Users
         SET loyalty_points = COALESCE(loyalty_points, 0) + ?,
             total_spent = COALESCE(total_spent, 0) + ?,
             lifetime_spending = COALESCE(lifetime_spending, 0) + ?
         WHERE id = ?`,
        [points, Number(amountPaid), Number(amountPaid), userId]
    );

    await conn.execute(
        'INSERT INTO Point_History (user_id, order_id, points, reason) VALUES (?, ?, ?, ?)',
        [userId, orderId, points, `Tich diem tu don hang #${orderId}`]
    );

    await conn.execute(`
        UPDATE Users
        SET membership_tier = CASE
            WHEN COALESCE(lifetime_spending, 0) >= 8000000 THEN 'diamond'
            WHEN COALESCE(lifetime_spending, 0) >= 3000000 THEN 'gold'
            WHEN COALESCE(lifetime_spending, 0) >= 1000000 THEN 'silver'
            ELSE 'bronze'
        END
        WHERE id = ?
    `, [userId]);

    return { points, alreadyProcessed: false };
}

module.exports = { processOrderLoyalty };
