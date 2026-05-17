const db = require('../config/db');
async function run() {
  try {
    const [users] = await db.execute("SELECT id, fullname, loyalty_points FROM Users WHERE loyalty_points > 0 LIMIT 5");
    console.log('Found users:', users);
    
    if (users.length > 0) {
      const userId = users[0].id;
      const [history] = await db.execute('SELECT * FROM Point_History WHERE user_id = ? ORDER BY created_at DESC', [userId]);
      console.log(`History for user ${userId}:`, history.length, 'entries');
      
      const [vouchers] = await db.execute('SELECT * FROM Coupons WHERE user_id = ?', [userId]);
      console.log(`Vouchers for user ${userId}:`, vouchers.length, 'entries');
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    process.exit();
  }
}
run();
