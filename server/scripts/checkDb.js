import pool from '../config/db.js';

async function check() {
  try {
    const res = await pool.query('SELECT id, name, email, role, is_active FROM users');
    console.log('--- USERS IN DB ---');
    console.table(res.rows);

    const catCols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'categories'");
    console.log('--- CATEGORIES COLUMNS ---');
    console.table(catCols.rows);

    const categories = await pool.query('SELECT * FROM categories');
    console.log('--- CATEGORIES DATA ---');
    console.table(categories.rows);

    const msgCols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'messages'");
    console.log('--- MESSAGES COLUMNS ---');
    console.table(msgCols.rows);

    process.exit(0);
  } catch (err) {
    console.error('Error during check:', err);
    process.exit(1);
  }
}

check();
