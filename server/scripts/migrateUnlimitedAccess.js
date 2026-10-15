import pool from '../config/db.js';

async function migrateUnlimitedAccess() {
  console.log('🚀 [Antigravity Terminal]: Starting Unlimited Access & Membership Migration...');

  try {
    // 1. Add has_unlimited_access column to users table
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS has_unlimited_access BOOLEAN DEFAULT false;
    `);
    console.log('✅ Added has_unlimited_access column to users table.');

    // 2. Add payment_type column to payments table
    await pool.query(`
      ALTER TABLE payments 
      ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50) DEFAULT 'unlimited_access';
    `);
    console.log('✅ Added payment_type column to payments table.');

    // 3. Automatically grant has_unlimited_access to admins and any user who previously had an approved payment
    const updateAdminsRes = await pool.query(`
      UPDATE users SET has_unlimited_access = true WHERE role = 'admin'
    `);
    console.log(`✅ Granted unlimited access to ${updateAdminsRes.rowCount} admin(s).`);

    const updatePaidUsersRes = await pool.query(`
      UPDATE users 
      SET has_unlimited_access = true 
      WHERE id IN (
        SELECT DISTINCT user_id FROM payments WHERE status = 'approved'
      )
    `);
    console.log(`✅ Granted unlimited access to ${updatePaidUsersRes.rowCount} user(s) with previous approved payments.`);

    console.log('🎉 Unlimited Access Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrateUnlimitedAccess();
