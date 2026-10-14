import pool from '../config/db.js';

async function migrateUserFreeTrial() {
  console.log('🚀 [Antigravity Terminal]: Starting User Free Trial Posts Migration...');

  try {
    // 1. Add free_trial_posts_remaining column to users table if not exists
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS free_trial_posts_remaining INTEGER DEFAULT 0;
    `);
    console.log('✅ Added free_trial_posts_remaining column to users table.');

    // 2. Fetch current system default free trial limit
    const settingRes = await pool.query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'free_trial_posts_count'`
    );
    const defaultLimit = settingRes.rows.length > 0 ? parseInt(settingRes.rows[0].setting_value, 10) || 3 : 3;
    console.log(`ℹ️ System default free trial limit: ${defaultLimit}`);

    // 3. Backfill existing users who have NULL free_trial_posts_remaining
    const usersRes = await pool.query(`SELECT id, name, email FROM users WHERE free_trial_posts_remaining IS NULL`);
    console.log(`Found ${usersRes.rows.length} existing users to initialize.`);

    for (const user of usersRes.rows) {
      // Count existing active listings
      const listCountRes = await pool.query(
        `SELECT COUNT(*)::int as count FROM listings WHERE user_id = $1 AND status != 'rejected'`,
        [user.id]
      );
      const usedPosts = listCountRes.rows[0].count;
      const remaining = Math.max(0, defaultLimit - usedPosts);

      await pool.query(
        `UPDATE users SET free_trial_posts_remaining = $1 WHERE id = $2`,
        [remaining, user.id]
      );
      console.log(`  - User ${user.email}: used ${usedPosts}, set remaining to ${remaining}`);
    }

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrateUserFreeTrial();
