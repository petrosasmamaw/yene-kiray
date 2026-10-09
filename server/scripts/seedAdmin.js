import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedAdmin() {
  console.log('🚀 [Antigravity Terminal]: Seeding Super Admin for የኔ ኪራይ...');

  const name = process.env.INITIAL_ADMIN_NAME || 'Yene Kiray Master Admin';
  const email = (process.env.INITIAL_ADMIN_EMAIL || 'admin@yenekiray.com').toLowerCase().trim();
  const password = process.env.INITIAL_ADMIN_PASSWORD || 'AdminPass@2026!';
  const phone = process.env.INITIAL_ADMIN_PHONE || '+251911000000';

  try {
    // Check if admin user already exists
    const checkUser = await pool.query('SELECT id, email, role FROM users WHERE email = $1', [email]);

    if (checkUser.rows.length > 0) {
      console.log(`⚠️ User with email "${email}" already exists with role: "${checkUser.rows[0].role}". Updating credentials...`);
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      await pool.query(
        'UPDATE users SET role = $1, is_active = true, password_hash = $2, name = $3 WHERE email = $4',
        ['admin', passwordHash, name, email]
      );
      console.log(`✅ Credentials and admin role updated for ${email}`);
      console.log('==================================================');
      console.log(`👤 Name:       ${name}`);
      console.log(`✉️ Email:      ${email}`);
      console.log(`🔑 Password:   ${password}`);
      console.log(`🛡️ Role:       admin`);
      console.log('==================================================');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert super admin
    const insertRes = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, 'admin', true)
       RETURNING id, name, email, role, created_at`,
      [name, email, phone, passwordHash]
    );

    const admin = insertRes.rows[0];
    console.log('🎉 Super Admin created successfully via terminal!');
    console.log('==================================================');
    console.log(`🆔 Admin ID:   ${admin.id}`);
    console.log(`👤 Name:       ${admin.name}`);
    console.log(`✉️ Email:      ${admin.email}`);
    console.log(`🔑 Password:   ${password}`);
    console.log(`🛡️ Role:       ${admin.role}`);
    console.log('==================================================');
    console.log('ℹ️ NOTE: Web registration is locked to role="user". Only this script can mint admins.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed Super Admin:', err.message);
    process.exit(1);
  }
}

seedAdmin();
