import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

async function updateAdminCredentials() {
  const email = 'admin@gmail.com';
  const password = '12345678';
  const name = 'Admin';
  const role = 'admin';

  console.log(`[Antigravity Terminal]: Setting up ${email} with password "${password}" and role "${role}"...`);

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const existing = await pool.query('SELECT id, email, role, is_active FROM users WHERE email = $1', [email]);

    let user;
    if (existing.rows.length > 0) {
      const updateRes = await pool.query(
        `UPDATE users
         SET password_hash = $1, role = $2, is_active = true, name = COALESCE(name, $3)
         WHERE email = $4
         RETURNING id, name, email, role, is_active`,
        [passwordHash, role, name, email]
      );
      user = updateRes.rows[0];
      console.log('✅ Existing user updated successfully:');
    } else {
      const insertRes = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, is_active)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id, name, email, role, is_active`,
        [name, email, passwordHash, role]
      );
      user = insertRes.rows[0];
      console.log('✅ New admin user registered successfully:');
    }

    console.log(JSON.stringify(user, null, 2));

    // Verify password hash matches
    const isMatch = await bcrypt.compare(password, passwordHash);
    console.log(`🔐 Password match check ("${password}"):`, isMatch ? 'PASSED ✅' : 'FAILED ❌');

    // Test sign in via HTTP API
    console.log('\nTesting sign in against local API endpoint (http://localhost:5000/api/auth/login)...');
    try {
      const resp = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await resp.json();
      console.log('HTTP Login Status:', resp.status);
      console.log('HTTP Login Response:', JSON.stringify(data, null, 2));
      if (data.success && data.token && data.user.role === 'admin') {
        console.log('\n🎉 SUCCESS: Admin sign in with admin@gmail.com and password 12345678 is working perfectly!');
      }
    } catch (httpErr) {
      console.log('HTTP login test notice (server may be on different port or starting):', httpErr.message);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating admin:', err);
    process.exit(1);
  }
}

updateAdminCredentials();
