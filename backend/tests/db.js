const pool = require('../src/config/db');
(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('DB connected! Time:', res.rows[0].now);
    process.exit(0);
  } catch (err) {
    console.error('DB connection failed:', err);
    process.exit(1);
  }
})();
