import pool from '../config/db.js';

async function check() {
  try {
    const res = await pool.query('SELECT * FROM system_settings');
    console.log('SYSTEM SETTINGS IN DB:', res.rows);
  } catch (err) {
    console.error('Error querying system_settings:', err);
  } finally {
    process.exit(0);
  }
}

check();
