import pool from '../config/db.js';

async function migrate() {
  try {
    console.log('Migrating system settings for payment accounts and free trial...');

    const settings = [
      {
        key: 'free_trial_posts_count',
        value: '3',
        description: 'Number of free rental posts allowed per user before payment is required (0 = always require payment)'
      },
      {
        key: 'telebirr_account_name',
        value: 'የኔ ኪራይ (Yene Kiray)',
        description: 'Official Telebirr account / beneficiary name'
      },
      {
        key: 'telebirr_account_number',
        value: '0911000000',
        description: 'Official Telebirr phone number or merchant code'
      },
      {
        key: 'cbe_account_name',
        value: 'የኔ ኪራይ (Yene Kiray)',
        description: 'Official CBE account holder name'
      },
      {
        key: 'cbe_account_number',
        value: '1000234567890',
        description: 'Official CBE bank account number'
      },
      {
        key: 'pay_to_post_enabled',
        value: 'true',
        description: 'Enable or disable required payment before rental post goes live'
      },
      {
        key: 'posting_fee_amount',
        value: '200',
        description: 'Standard fee in ETB charged to post a rental listing'
      }
    ];

    for (const s of settings) {
      await pool.query(
        `INSERT INTO system_settings (setting_key, setting_value, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (setting_key) DO UPDATE 
         SET description = EXCLUDED.description`,
        [s.key, s.value, s.description]
      );
    }

    // Check all settings
    const res = await pool.query('SELECT * FROM system_settings ORDER BY setting_key ASC');
    console.log('Current settings in DB:');
    res.rows.forEach(r => console.log(`  ${r.setting_key}: ${r.setting_value}`));

    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
