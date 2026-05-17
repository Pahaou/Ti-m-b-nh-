const db = require('../config/db');

async function checkNotifs() {
    try {
        const [rows] = await db.execute('SELECT * FROM Notifications ORDER BY created_at DESC LIMIT 5');
        console.log('LATEST NOTIFICATIONS:');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkNotifs();
