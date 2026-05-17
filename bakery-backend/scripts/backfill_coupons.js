const db = require('../config/db');
async function run() {
  try {
    const [history] = await db.execute("SELECT user_id, reason FROM Point_History WHERE reason LIKE '%Mã: %'");
    console.log(`Found ${history.length} history entries with codes`);
    for (const entry of history) {
      const match = entry.reason.match(/\(Mã: ([^)]+)\)/);
      if (match) {
        const code = match[1];
        await db.execute('UPDATE Coupons SET user_id = ? WHERE code = ? AND user_id IS NULL', [entry.user_id, code]);
      }
    }
    console.log('Backfill completed successfully');
  } catch (e) {
    console.error('Error during backfill:', e.message);
  } finally {
    process.exit();
  }
}
run();
