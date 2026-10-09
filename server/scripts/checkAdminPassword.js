import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

async function checkAdmin() {
  const res = await pool.query('SELECT password_hash FROM users WHERE email = $1', ['admin@gmail.com']);
  if (res.rows.length === 0) {
    console.log('Admin not found');
    process.exit(1);
  }
  const hash = res.rows[0].password_hash;
  const matchPassword = await bcrypt.compare('password', hash);
  const match123 = await bcrypt.compare('123456789', hash);
  console.log('Matches "password":', matchPassword);
  console.log('Matches "123456789":', match123);

  if (!matchPassword) {
    console.log('Setting admin password to "password" as requested by user...');
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash('password', salt);
    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [newHash, 'admin@gmail.com']);
    console.log('Admin password successfully set to "password"!');
  }
  process.exit(0);
}

checkAdmin();
