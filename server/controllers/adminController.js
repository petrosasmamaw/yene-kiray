import pool from '../config/db.js';

// @desc    Admin: Get financial overview & platform metrics
// @route   GET /api/admin/financial-dashboard
// @access  Private / Admin
export const getFinancialDashboard = async (req, res) => {
  try {
    // 1. Total revenue from approved payments
    const revenueRes = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total_revenue FROM payments WHERE status = 'approved'"
    );
    const totalRevenue = parseFloat(revenueRes.rows[0].total_revenue);

    // 2. Count of pending payment approvals
    const pendingPayRes = await pool.query(
      "SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS pending_amount FROM payments WHERE status = 'pending'"
    );

    // 3. Count of approved transactions
    const approvedPayRes = await pool.query(
      "SELECT COUNT(*) AS count FROM payments WHERE status = 'approved'"
    );

    // 4. Platform user & listing counts
    const usersCountRes = await pool.query('SELECT COUNT(*) AS total_users FROM users WHERE role = $1', ['user']);
    const listingsCountRes = await pool.query(
      `SELECT 
        COUNT(*) AS total_listings,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved_listings,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_listings
       FROM listings`
    );

    // 5. Recent payments log
    const recentPaymentsRes = await pool.query(
      `SELECT 
        p.*,
        u.name AS user_name,
        u.email AS user_email,
        u.phone AS user_phone,
        l.title AS listing_title
       FROM payments p
       LEFT JOIN users u ON p.user_id = u.id
       LEFT JOIN listings l ON p.listing_id = l.id
       ORDER BY p.created_at DESC
       LIMIT 10`
    );

    // 6. Current Monetization Settings
    const settingsRes = await pool.query(
      "SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ('pay_to_post_enabled', 'posting_fee_amount', 'payment_instructions')"
    );

    const settings = {};
    settingsRes.rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });

    return res.json({
      success: true,
      data: {
        financials: {
          totalRevenue,
          pendingAmount: parseFloat(pendingPayRes.rows[0].pending_amount),
          pendingCount: parseInt(pendingPayRes.rows[0].count, 10),
          approvedCount: parseInt(approvedPayRes.rows[0].count, 10)
        },
        counts: {
          totalUsers: parseInt(usersCountRes.rows[0].total_users, 10),
          totalListings: parseInt(listingsCountRes.rows[0].total_listings, 10),
          approvedListings: parseInt(listingsCountRes.rows[0].approved_listings, 10),
          pendingListings: parseInt(listingsCountRes.rows[0].pending_listings, 10)
        },
        recentPayments: recentPaymentsRes.rows,
        settings
      }
    });
  } catch (error) {
    console.error('getFinancialDashboard error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: List all payments with filter
// @route   GET /api/admin/payments
// @access  Private / Admin
export const getAllPayments = async (req, res) => {
  try {
    const { status } = req.query; // 'pending', 'approved', 'rejected'

    let queryText = `
      SELECT 
        p.*,
        u.name AS user_name,
        u.email AS user_email,
        u.phone AS user_phone,
        l.title AS listing_title,
        l.rental_price AS listing_price
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN listings l ON p.listing_id = l.id
    `;

    const params = [];
    if (status) {
      queryText += ' WHERE p.status = $1';
      params.push(status);
    }

    queryText += ' ORDER BY p.created_at DESC';

    const result = await pool.query(queryText, params);
    return res.json({ success: true, count: result.rows.length, payments: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Approve or Reject a payment (Controls listing publication)
// @route   PUT /api/admin/payments/:id/status
// @access  Private / Admin
export const updatePaymentStatus = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { status, admin_notes } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'approved', 'rejected', or 'pending'" });
    }

    const payRes = await client.query('SELECT * FROM payments WHERE id = $1', [id]);
    if (payRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const payment = payRes.rows[0];

    // Update payment record
    const updatedPayRes = await client.query(
      `UPDATE payments
       SET status = $1,
           admin_notes = COALESCE($2, admin_notes),
           reviewed_by = $3,
           reviewed_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [status, admin_notes, req.user.id, id]
    );

    // If status is 'approved', update the associated listing to 'approved' and 'is_paid = true'
    if (status === 'approved' && payment.listing_id) {
      await client.query(
        "UPDATE listings SET status = 'approved', is_paid = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [payment.listing_id]
      );
    } else if (status === 'rejected' && payment.listing_id) {
      await client.query(
        "UPDATE listings SET status = 'rejected', is_paid = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [payment.listing_id]
      );
    }

    await client.query('COMMIT');

    return res.json({
      success: true,
      message: `Payment marked as ${status}. Listing status updated accordingly.`,
      payment: updatedPayRes.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('updatePaymentStatus error:', error);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// @desc    Admin: Get all users with status
// @route   GET /api/admin/users
// @access  Private / Admin
export const getAllUsers = async (req, res) => {
  try {
    const { search, status } = req.query;

    let queryText = `
      SELECT 
        u.id, u.name, u.email, u.phone, u.role, u.is_active, u.avatar_url, u.created_at,
        COUNT(l.id) AS listings_count
      FROM users u
      LEFT JOIN listings l ON l.user_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (search) {
      queryText += ` AND (u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR u.phone ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status === 'active') {
      queryText += ` AND u.is_active = true`;
    } else if (status === 'inactive') {
      queryText += ` AND u.is_active = false`;
    }

    queryText += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    const result = await pool.query(queryText, params);
    return res.json({ success: true, count: result.rows.length, users: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Toggle user active/inactive & edit profile & role
// @route   PUT /api/admin/users/:id
// @access  Private / Admin
export const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, name, phone, bio, role } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET is_active = COALESCE($1, is_active),
           name = COALESCE($2, name),
           phone = COALESCE($3, phone),
           bio = COALESCE($4, bio),
           role = COALESCE($5, role),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, name, email, phone, role, is_active, bio, created_at`,
      [is_active, name, phone, bio, role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      message: 'User profile updated successfully by admin',
      user: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Update system monetization settings (Pay-to-post toggle & fee amount)
// @route   PUT /api/admin/settings
// @access  Private / Admin
export const updateSettings = async (req, res) => {
  try {
    const { pay_to_post_enabled, posting_fee_amount, payment_instructions } = req.body;

    if (pay_to_post_enabled !== undefined) {
      await pool.query(
        "UPDATE system_settings SET setting_value = $1, updated_at = CURRENT_TIMESTAMP WHERE setting_key = 'pay_to_post_enabled'",
        [String(pay_to_post_enabled)]
      );
    }

    if (posting_fee_amount !== undefined) {
      await pool.query(
        "UPDATE system_settings SET setting_value = $1, updated_at = CURRENT_TIMESTAMP WHERE setting_key = 'posting_fee_amount'",
        [String(posting_fee_amount)]
      );
    }

    if (payment_instructions !== undefined) {
      await pool.query(
        "UPDATE system_settings SET setting_value = $1, updated_at = CURRENT_TIMESTAMP WHERE setting_key = 'payment_instructions'",
        [payment_instructions]
      );
    }

    const settingsRes = await pool.query('SELECT setting_key, setting_value FROM system_settings');
    const settings = {};
    settingsRes.rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });

    return res.json({
      success: true,
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get public system settings (whether payment is currently required to post)
// @route   GET /api/admin/settings/public
// @access  Public
export const getPublicSettings = async (req, res) => {
  try {
    const settingsRes = await pool.query(
      "SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ('pay_to_post_enabled', 'posting_fee_amount', 'payment_instructions')"
    );

    const settings = {};
    settingsRes.rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });

    return res.json({
      success: true,
      settings: {
        pay_to_post_enabled: settings.pay_to_post_enabled === 'true',
        posting_fee_amount: parseFloat(settings.posting_fee_amount) || 200,
        payment_instructions: settings.payment_instructions || ''
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
