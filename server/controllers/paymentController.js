import pool from '../config/db.js';

// @desc    Submit payment proof for unlimited membership or pending listing
// @route   POST /api/payments/submit
// @access  Private
export const submitPaymentProof = async (req, res) => {
  try {
    const { 
      listing_id, 
      payment_method, 
      transaction_reference, 
      receipt_image_url, 
      amount,
      payment_type = (listing_id ? 'listing_fee' : 'unlimited_access')
    } = req.body;

    if (!payment_method) {
      return res.status(400).json({ success: false, message: 'Payment method is required' });
    }

    // CASE 1: One-Time Unlimited Membership Payment (no listing_id required)
    if (!listing_id || payment_type === 'unlimited_access') {
      // Check if user has an existing pending membership payment
      const existingPay = await pool.query(
        "SELECT id FROM payments WHERE user_id = $1 AND (payment_type = 'unlimited_access' OR listing_id IS NULL) AND status = 'pending' ORDER BY created_at DESC LIMIT 1",
        [req.user.id]
      );

      let payment;
      if (existingPay.rows.length > 0) {
        const updateRes = await pool.query(
          `UPDATE payments
           SET payment_method = $1,
               transaction_reference = $2,
               receipt_image_url = $3,
               status = 'pending',
               payment_type = 'unlimited_access',
               amount = COALESCE($4, amount),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $5
           RETURNING *`,
          [payment_method, transaction_reference || null, receipt_image_url || null, amount, existingPay.rows[0].id]
        );
        payment = updateRes.rows[0];
      } else {
        const insertRes = await pool.query(
          `INSERT INTO payments (
            user_id, listing_id, amount, payment_method, transaction_reference, receipt_image_url, status, payment_type
          )
          VALUES ($1, NULL, $2, $3, $4, $5, 'pending', 'unlimited_access')
          RETURNING *`,
          [req.user.id, amount || 200, payment_method, transaction_reference || null, receipt_image_url || null]
        );
        payment = insertRes.rows[0];
      }

      return res.json({
        success: true,
        message: 'Unlimited access payment submitted! Admin will verify and activate your lifetime unlimited posting.',
        payment
      });
    }

    // CASE 2: Specific listing payment
    // Verify user owns the listing
    const listingRes = await pool.query('SELECT id, user_id, status FROM listings WHERE id = $1', [listing_id]);
    if (listingRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listingRes.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You do not own this listing' });
    }

    // Check if a payment record exists for this listing
    const existingPay = await pool.query(
      'SELECT id FROM payments WHERE listing_id = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 1',
      [listing_id, req.user.id]
    );

    let payment;
    if (existingPay.rows.length > 0) {
      const updateRes = await pool.query(
        `UPDATE payments
         SET payment_method = $1,
             transaction_reference = $2,
             receipt_image_url = $3,
             status = 'pending',
             payment_type = 'listing_fee',
             amount = COALESCE($4, amount),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [payment_method, transaction_reference || null, receipt_image_url || null, amount, existingPay.rows[0].id]
      );
      payment = updateRes.rows[0];
    } else {
      const insertRes = await pool.query(
        `INSERT INTO payments (
          user_id, listing_id, amount, payment_method, transaction_reference, receipt_image_url, status, payment_type
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'pending', 'listing_fee')
        RETURNING *`,
        [req.user.id, listing_id, amount || 200, payment_method, transaction_reference || null, receipt_image_url || null]
      );
      payment = insertRes.rows[0];
    }

    // Ensure listing is in 'pending' status
    await pool.query("UPDATE listings SET status = 'pending' WHERE id = $1", [listing_id]);

    return res.json({
      success: true,
      message: 'Payment proof submitted! Your listing is under pending review by the admin team.',
      payment
    });
  } catch (error) {
    console.error('submitPaymentProof error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's payment history
// @route   GET /api/payments/my-payments
// @access  Private
export const getMyPayments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, l.title AS listing_title
       FROM payments p
       LEFT JOIN listings l ON p.listing_id = l.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    return res.json({ success: true, payments: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
