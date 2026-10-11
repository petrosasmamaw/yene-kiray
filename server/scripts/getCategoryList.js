import pool from '../config/db.js';

async function main() {
  try {
    const res = await pool.query('SELECT id, name, name_am, slug, icon_name, image_url FROM categories ORDER BY id ASC');
    console.log('CATEGORIES_FOUND:');
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error fetching categories:', err);
    process.exit(1);
  }
}

main();
