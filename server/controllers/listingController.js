import pool from '../config/db.js';

// Fast in-memory cache for listings queries (20 seconds TTL)
const listingsCache = new Map();
const CACHE_TTL_MS = 20000;

export const clearListingsCache = () => {
  listingsCache.clear();
};

// @desc    Get public approved listings (with search, category & location filters)
// @route   GET /api/listings
// @access  Public
export const getListings = async (req, res) => {
  try {
    const { category, search, city, minPrice, maxPrice, period, sort, page, limit } = req.query;

    // Check fast cache
    const cacheKey = JSON.stringify(req.query);
    const cached = listingsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached.data);
    }

    const params = [];
    let paramIndex = 1;

    let queryText = `
      SELECT 
        l.*,
        c.name AS category_name,
        c.name_am AS category_name_am,
        c.slug AS category_slug,
        u.name AS owner_name,
        u.phone AS owner_phone,
        u.avatar_url AS owner_avatar,
        COUNT(*) OVER() AS full_count,
        COALESCE(
          json_agg(
            json_build_object(
              'id', li.id,
              'image_url', li.image_url,
              'is_primary', li.is_primary
            ) ORDER BY li.is_primary DESC, li.id ASC
          ) FILTER (WHERE li.id IS NOT NULL), '[]'
        ) AS images
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN listing_images li ON li.listing_id = l.id
      WHERE l.status = 'approved'
    `;

    if (category) {
      queryText += ` AND (c.slug = $${paramIndex} OR l.category_id::text = $${paramIndex})`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      queryText += ` AND (l.title ILIKE $${paramIndex} OR l.description ILIKE $${paramIndex} OR l.specific_location ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (city) {
      if (city === 'Other' || city === 'other' || city === 'Other Cities') {
        queryText += ` AND (l.city ILIKE '%Other%' OR l.city NOT ILIKE ANY(ARRAY['%Addis Ababa%', '%Hawassa%', '%Adama%', '%Bahir Dar%', '%Bishoftu%', '%Mekelle%', '%Dire Dawa%', '%Gondar%', '%Jimma%']))`;
      } else {
        queryText += ` AND l.city ILIKE $${paramIndex}`;
        params.push(`%${city}%`);
        paramIndex++;
      }
    }

    if (minPrice) {
      queryText += ` AND l.rental_price >= $${paramIndex}`;
      params.push(Number(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      queryText += ` AND l.rental_price <= $${paramIndex}`;
      params.push(Number(maxPrice));
      paramIndex++;
    }

    if (period) {
      queryText += ` AND l.price_period = $${paramIndex}`;
      params.push(period);
      paramIndex++;
    }

    queryText += ` GROUP BY l.id, c.id, c.name, c.name_am, c.slug, u.name, u.phone, u.avatar_url`;

    // Sorting: when viewing all listings (no category filter), group by category order (houses, cars, shops, machinery, venues, tools)
    if (sort === 'price_asc') {
      queryText += ` ORDER BY l.rental_price ASC`;
    } else if (sort === 'price_desc') {
      queryText += ` ORDER BY l.rental_price DESC`;
    } else if (category) {
      queryText += ` ORDER BY l.created_at DESC`;
    } else {
      queryText += ` ORDER BY c.id ASC, l.created_at DESC`;
    }

    const parsedLimit = limit === 'all' ? null : (parseInt(limit, 10) || 10);
    const parsedPage = Math.max(1, parseInt(page || 1, 10));

    if (parsedLimit !== null) {
      const offset = (parsedPage - 1) * parsedLimit;
      queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parsedLimit, offset);
      paramIndex += 2;
    }

    const result = await pool.query(queryText, params);

    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].full_count, 10) : 0;
    const effectiveLimit = parsedLimit || totalCount || 10;
    const totalPages = effectiveLimit > 0 ? Math.ceil(totalCount / effectiveLimit) : 1;

    const responseData = {
      success: true,
      count: result.rows.length,
      total: totalCount,
      page: parsedPage,
      limit: effectiveLimit,
      totalPages: totalPages || 1,
      hasMore: parsedPage < totalPages,
      listings: result.rows
    };

    // Cache the response in memory
    listingsCache.set(cacheKey, { timestamp: Date.now(), data: responseData });
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=45');

    return res.json(responseData);
  } catch (error) {
    console.error('getListings error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single listing details by ID
// @route   GET /api/listings/:id
// @access  Public
export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    // Increment views count
    await pool.query('UPDATE listings SET views_count = views_count + 1 WHERE id = $1', [id]);

    const result = await pool.query(
      `SELECT 
        l.*,
        c.name AS category_name,
        c.name_am AS category_name_am,
        c.slug AS category_slug,
        u.id AS owner_id,
        u.name AS owner_name,
        u.phone AS owner_phone,
        u.avatar_url AS owner_avatar,
        COALESCE(
          json_agg(
            json_build_object(
              'id', li.id,
              'image_url', li.image_url,
              'public_id', li.public_id,
              'is_primary', li.is_primary
            ) ORDER BY li.is_primary DESC, li.id ASC
          ) FILTER (WHERE li.id IS NOT NULL), '[]'
        ) AS images
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN listing_images li ON li.listing_id = l.id
      WHERE l.id = $1
      GROUP BY l.id, c.name, c.name_am, c.slug, u.id, u.name, u.phone, u.avatar_url`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    return res.json({ success: true, listing: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new listing (Handles free vs pay-to-post mode dynamically)
// @route   POST /api/listings
// @access  Private
export const createListing = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      title,
      description,
      category_id,
      rental_price,
      price_period,
      city,
      subcity,
      specific_location,
      contact_phone,
      features,
      images = [] // Array of { image_url, public_id }
    } = req.body;

    if (!title || !description || !rental_price || !city || !contact_phone) {
      return res.status(400).json({ success: false, message: 'Missing required listing fields' });
    }

    // 1. Fetch current Admin Pay-to-Post configuration & accounts
    const settingsRes = await client.query('SELECT setting_key, setting_value FROM system_settings');
    const settingsMap = {};
    settingsRes.rows.forEach((row) => {
      settingsMap[row.setting_key] = row.setting_value;
    });

    let payToPostEnabled = settingsMap.pay_to_post_enabled === 'true';
    let postingFeeAmount = parseFloat(settingsMap.posting_fee_amount) || 200;
    let freeTrialCount = parseInt(settingsMap.free_trial_posts_count ?? '3', 10);
    if (isNaN(freeTrialCount)) freeTrialCount = 3;

    // 2. Count existing non-rejected listings created by this user
    const userListingsRes = await client.query(
      "SELECT COUNT(*) AS count FROM listings WHERE user_id = $1 AND status != 'rejected'",
      [req.user.id]
    );
    const userListingsCount = parseInt(userListingsRes.rows[0].count, 10) || 0;

    // Check if user qualifies for Free Trial
    const isFreeTrial = freeTrialCount > 0 && userListingsCount < freeTrialCount;

    // If Free Trial: immediate approval & paid=true; if not free trial and payToPostEnabled: pending & paid=false
    const requiresPayment = !isFreeTrial && payToPostEnabled;
    const initialStatus = requiresPayment ? 'pending' : 'approved';
    const initialPaid = !requiresPayment;

    const listingRes = await client.query(
      `INSERT INTO listings (
        user_id, category_id, title, description, rental_price, price_period,
        city, subcity, specific_location, contact_phone, features, status, is_paid
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        req.user.id,
        category_id || null,
        title.trim(),
        description.trim(),
        rental_price,
        price_period || 'month',
        city.trim(),
        subcity || null,
        specific_location || null,
        contact_phone.trim(),
        JSON.stringify(features || []),
        initialStatus,
        initialPaid
      ]
    );

    const newListing = listingRes.rows[0];

    // 3. Insert images if provided
    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await client.query(
          `INSERT INTO listing_images (listing_id, image_url, public_id, is_primary)
           VALUES ($1, $2, $3, $4)`,
          [newListing.id, img.image_url, img.public_id || null, i === 0]
        );
      }
    }

    // 4. If payment is required, create an initial pending payment record
    let paymentRecord = null;
    if (requiresPayment) {
      const payRes = await client.query(
        `INSERT INTO payments (
          user_id, listing_id, amount, currency, payment_method, status
        )
        VALUES ($1, $2, $3, 'ETB', 'Telebirr', 'pending')
        RETURNING *`,
        [req.user.id, newListing.id, postingFeeAmount]
      );
      paymentRecord = payRes.rows[0];
    }

    await client.query('COMMIT');
    clearListingsCache();

    return res.status(201).json({
      success: true,
      message: isFreeTrial
        ? `Free trial post (${userListingsCount + 1}/${freeTrialCount}) published live!`
        : requiresPayment
        ? 'Listing submitted! Please complete the listing payment via Telebirr or CBE to activate.'
        : 'Listing published successfully! It is now live.',
      requires_payment: requiresPayment,
      is_free_trial: isFreeTrial,
      free_trial_used: userListingsCount + 1,
      free_trial_limit: freeTrialCount,
      posting_fee: postingFeeAmount,
      accounts: {
        telebirr: {
          name: settingsMap.telebirr_account_name || 'የኔ ኪራይ (Yene Kiray)',
          number: settingsMap.telebirr_account_number || '0911000000'
        },
        cbe: {
          name: settingsMap.cbe_account_name || 'የኔ ኪራይ (Yene Kiray)',
          number: settingsMap.cbe_account_number || '1000234567890'
        }
      },
      listing: newListing,
      payment: paymentRecord
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('createListing error:', error);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// @desc    Get user's own listings
// @route   GET /api/listings/my-listings
// @access  Private
export const getMyListings = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const parsedLimit = limit === 'all' ? null : (parseInt(limit, 10) || 10);
    const parsedPage = Math.max(1, parseInt(page || 1, 10));

    let queryText = `
      SELECT 
        l.*,
        c.name AS category_name,
        c.name_am AS category_name_am,
        p.id AS payment_id,
        p.status AS payment_status,
        p.amount AS payment_amount,
        COUNT(*) OVER() AS full_count,
        COALESCE(
          json_agg(
            json_build_object('id', li.id, 'image_url', li.image_url, 'is_primary', li.is_primary)
            ORDER BY li.is_primary DESC, li.id ASC
          ) FILTER (WHERE li.id IS NOT NULL), '[]'
        ) AS images
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN listing_images li ON li.listing_id = l.id
      LEFT JOIN payments p ON p.listing_id = l.id
      WHERE l.user_id = $1
      GROUP BY l.id, c.name, c.name_am, p.id, p.status, p.amount
      ORDER BY l.created_at DESC
    `;

    const params = [req.user.id];
    if (parsedLimit !== null) {
      const offset = (parsedPage - 1) * parsedLimit;
      queryText += ` LIMIT $2 OFFSET $3`;
      params.push(parsedLimit, offset);
    }

    const result = await pool.query(queryText, params);
    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].full_count, 10) : 0;
    const effectiveLimit = parsedLimit || totalCount || 10;
    const totalPages = effectiveLimit > 0 ? Math.ceil(totalCount / effectiveLimit) : 1;

    return res.json({
      success: true,
      count: result.rows.length,
      total: totalCount,
      page: parsedPage,
      limit: effectiveLimit,
      totalPages: totalPages || 1,
      hasMore: parsedPage < totalPages,
      listings: result.rows
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bookmark / Save or Unsave a listing
// @route   POST /api/listings/:id/save
// @access  Private
export const toggleSaveListing = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query(
      'SELECT id FROM saved_listings WHERE user_id = $1 AND listing_id = $2',
      [req.user.id, id]
    );

    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM saved_listings WHERE user_id = $1 AND listing_id = $2', [
        req.user.id,
        id
      ]);
      return res.json({ success: true, saved: false, message: 'Listing removed from saved' });
    } else {
      await pool.query('INSERT INTO saved_listings (user_id, listing_id) VALUES ($1, $2)', [
        req.user.id,
        id
      ]);
      return res.json({ success: true, saved: true, message: 'Listing saved to favorites' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's saved/bookmarked listings
// @route   GET /api/listings/saved
// @access  Private
export const getSavedListings = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const parsedLimit = limit === 'all' ? null : (parseInt(limit, 10) || 10);
    const parsedPage = Math.max(1, parseInt(page || 1, 10));

    let queryText = `
      SELECT 
        l.*,
        c.name AS category_name,
        c.name_am AS category_name_am,
        u.name AS owner_name,
        COUNT(*) OVER() AS full_count,
        COALESCE(
          json_agg(
            json_build_object('id', li.id, 'image_url', li.image_url, 'is_primary', li.is_primary)
            ORDER BY li.is_primary DESC, li.id ASC
          ) FILTER (WHERE li.id IS NOT NULL), '[]'
        ) AS images
      FROM saved_listings sl
      JOIN listings l ON sl.listing_id = l.id
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN listing_images li ON li.listing_id = l.id
      WHERE sl.user_id = $1
      GROUP BY l.id, c.name, c.name_am, u.name, sl.created_at
      ORDER BY sl.created_at DESC
    `;

    const params = [req.user.id];
    if (parsedLimit !== null) {
      const offset = (parsedPage - 1) * parsedLimit;
      queryText += ` LIMIT $2 OFFSET $3`;
      params.push(parsedLimit, offset);
    }

    const result = await pool.query(queryText, params);
    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].full_count, 10) : 0;
    const effectiveLimit = parsedLimit || totalCount || 10;
    const totalPages = effectiveLimit > 0 ? Math.ceil(totalCount / effectiveLimit) : 1;

    return res.json({
      success: true,
      count: result.rows.length,
      total: totalCount,
      page: parsedPage,
      limit: effectiveLimit,
      totalPages: totalPages || 1,
      hasMore: parsedPage < totalPages,
      listings: result.rows
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update listing (Owner or Admin)
// @route   PUT /api/listings/:id
// @access  Private
export const updateListing = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const {
      title,
      description,
      category_id,
      rental_price,
      price_period,
      city,
      subcity,
      specific_location,
      contact_phone,
      features,
      status,
      images
    } = req.body;

    const existingRes = await client.query('SELECT * FROM listings WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const listing = existingRes.rows[0];
    if (listing.user_id !== req.user.id && req.user.role !== 'admin') {
      await client.query('ROLLBACK');
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this listing' });
    }

    const updatedRes = await client.query(
      `UPDATE listings
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category_id = COALESCE($3, category_id),
           rental_price = COALESCE($4, rental_price),
           price_period = COALESCE($5, price_period),
           city = COALESCE($6, city),
           subcity = COALESCE($7, subcity),
           specific_location = COALESCE($8, specific_location),
           contact_phone = COALESCE($9, contact_phone),
           features = CASE WHEN $10::jsonb IS NOT NULL THEN $10::jsonb ELSE features END,
           status = COALESCE($11, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [
        title ? title.trim() : null,
        description ? description.trim() : null,
        category_id || null,
        rental_price || null,
        price_period || null,
        city ? city.trim() : null,
        subcity || null,
        specific_location || null,
        contact_phone ? contact_phone.trim() : null,
        features ? JSON.stringify(features) : null,
        status || null,
        id
      ]
    );

    // If new images array provided, replace listing images
    if (Array.isArray(images) && images.length > 0) {
      await client.query('DELETE FROM listing_images WHERE listing_id = $1', [id]);
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imgUrl = typeof img === 'string' ? img : img.image_url;
        const pubId = typeof img === 'object' ? img.public_id : null;
        if (imgUrl) {
          await client.query(
            `INSERT INTO listing_images (listing_id, image_url, public_id, is_primary)
             VALUES ($1, $2, $3, $4)`,
            [id, imgUrl, pubId, i === 0]
          );
        }
      }
    }

    await client.query('COMMIT');

    return res.json({
      success: true,
      message: 'Listing updated successfully',
      listing: updatedRes.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('updateListing error:', error);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// @desc    Delete listing (Owner or Admin)
// @route   DELETE /api/listings/:id
// @access  Private
export const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    const existingRes = await pool.query('SELECT * FROM listings WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const listing = existingRes.rows[0];
    if (listing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this listing' });
    }

    await pool.query('DELETE FROM listings WHERE id = $1', [id]);

    return res.json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Get all listings across all users
// @route   GET /api/admin/listings
// @access  Private / Admin
export const getAllListingsAdmin = async (req, res) => {
  try {
    const { status, search, category_id } = req.query;

    let queryText = `
      SELECT 
        l.*,
        c.name AS category_name,
        c.name_am AS category_name_am,
        u.name AS owner_name,
        u.email AS owner_email,
        u.phone AS owner_phone,
        COALESCE(
          json_agg(
            json_build_object('id', li.id, 'image_url', li.image_url, 'is_primary', li.is_primary)
          ) FILTER (WHERE li.id IS NOT NULL), '[]'
        ) AS images
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN listing_images li ON li.listing_id = l.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      queryText += ` AND l.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (category_id) {
      queryText += ` AND l.category_id = $${paramIndex}`;
      params.push(category_id);
      paramIndex++;
    }

    if (search) {
      queryText += ` AND (l.title ILIKE $${paramIndex} OR l.city ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` GROUP BY l.id, c.name, c.name_am, u.name, u.email, u.phone ORDER BY l.created_at DESC`;

    const result = await pool.query(queryText, params);
    return res.json({ success: true, count: result.rows.length, listings: result.rows });
  } catch (error) {
    console.error('getAllListingsAdmin error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Update listing status (e.g. approve, reject, mark rented)
// @route   PUT /api/admin/listings/:id/status
// @access  Private / Admin
export const updateListingStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'pending', 'rejected', 'rented'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const result = await pool.query(
      `UPDATE listings 
       SET status = $1,
           is_paid = CASE WHEN $1 = 'approved' THEN true ELSE is_paid END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    return res.json({
      success: true,
      message: `Listing status updated to ${status}`,
      listing: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's posting eligibility (free trial remaining, fee, accounts)
// @route   GET /api/listings/user/posting-eligibility
// @access  Private
export const getPostingEligibility = async (req, res) => {
  try {
    const settingsRes = await pool.query('SELECT setting_key, setting_value FROM system_settings');
    const settingsMap = {};
    settingsRes.rows.forEach((row) => {
      settingsMap[row.setting_key] = row.setting_value;
    });

    const payToPostEnabled = settingsMap.pay_to_post_enabled === 'true';
    const postingFeeAmount = parseFloat(settingsMap.posting_fee_amount) || 200;
    const freeTrialCount = parseInt(settingsMap.free_trial_posts_count ?? '3', 10);

    const userListingsRes = await pool.query(
      "SELECT COUNT(*) AS count FROM listings WHERE user_id = $1 AND status != 'rejected'",
      [req.user.id]
    );
    const userListingsCount = parseInt(userListingsRes.rows[0].count, 10) || 0;

    const freeRemaining = Math.max(0, freeTrialCount - userListingsCount);
    const isFreeNext = freeTrialCount > 0 && userListingsCount < freeTrialCount;
    const requiresPayment = !isFreeNext && payToPostEnabled;

    return res.json({
      success: true,
      data: {
        user_listings_count: userListingsCount,
        free_trial_posts_count: freeTrialCount,
        free_posts_remaining: freeRemaining,
        is_free_next: isFreeNext,
        requires_payment: requiresPayment,
        posting_fee: postingFeeAmount,
        accounts: {
          telebirr: {
            name: settingsMap.telebirr_account_name || 'የኔ ኪራይ (Yene Kiray)',
            number: settingsMap.telebirr_account_number || '0911000000'
          },
          cbe: {
            name: settingsMap.cbe_account_name || 'የኔ ኪራይ (Yene Kiray)',
            number: settingsMap.cbe_account_number || '1000234567890'
          }
        }
      }
    });
  } catch (error) {
    console.error('getPostingEligibility error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

