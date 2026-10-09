import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

async function verifyAllAccounts() {
  const accounts = [
    { email: 'admin@gmail.com', pass: '12345678', expectedRole: 'admin' },
    { email: 'client1@gmail.com', pass: '12345678', expectedRole: 'user' },
    { email: 'client2@gmail.com', pass: '12345678', expectedRole: 'user' }
  ];

  console.log('Verifying accounts in DB...');
  for (const acc of accounts) {
    const res = await pool.query('SELECT id, name, email, role, is_active, password_hash FROM users WHERE email = $1', [acc.email]);
    if (res.rows.length === 0) {
      console.log(`❌ User ${acc.email} not found.`);
      continue;
    }
    const user = res.rows[0];
    const match = await bcrypt.compare(acc.pass, user.password_hash);
    console.log(`User: ${acc.email} | Role: ${user.role} | Active: ${user.is_active} | Password ("${acc.pass}") Match: ${match ? '✅' : '❌'}`);
  }
  process.exit(0);
}

verifyAllAccounts();
