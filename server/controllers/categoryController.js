import pool from '../config/db.js';

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, 
        COUNT(l.id) FILTER (WHERE l.status = 'approved') AS listings_count
       FROM categories c
       LEFT JOIN listings l ON l.category_id = c.id
       WHERE c.is_active = true
       GROUP BY c.id
       ORDER BY c.id ASC`
    );

    return res.json({ success: true, categories: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Get all categories (including inactive)
// @route   GET /api/categories/admin
// @access  Private / Admin
export const getAdminCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, 
        COUNT(l.id) AS total_listings_count
       FROM categories c
       LEFT JOIN listings l ON l.category_id = c.id
       GROUP BY c.id
       ORDER BY c.id ASC`
    );

    return res.json({ success: true, categories: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Create category
// @route   POST /api/categories
// @access  Private / Admin
export const createCategory = async (req, res) => {
  try {
    const { name, name_am, slug, description, description_am, icon_name, image_url } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Category name and slug are required' });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const result = await pool.query(
      `INSERT INTO categories (name, name_am, slug, description, description_am, icon_name, image_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING *`,
      [name.trim(), name_am ? name_am.trim() : null, cleanSlug, description || '', description_am || '', icon_name || 'Layers', image_url || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'A category with this slug already exists' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Update category
// @route   PUT /api/categories/:id
// @access  Private / Admin
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, name_am, slug, description, description_am, icon_name, image_url, is_active } = req.body;

    const result = await pool.query(
      `UPDATE categories 
       SET name = COALESCE($1, name),
           name_am = COALESCE($2, name_am),
           slug = COALESCE($3, slug),
           description = COALESCE($4, description),
           description_am = COALESCE($5, description_am),
           icon_name = COALESCE($6, icon_name),
           image_url = COALESCE($7, image_url),
           is_active = COALESCE($8, is_active)
       WHERE id = $9
       RETURNING *`,
      [name, name_am, slug, description, description_am, icon_name, image_url, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    return res.json({
      success: true,
      message: 'Category updated successfully',
      category: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Delete category
// @route   DELETE /api/categories/:id
// @access  Private / Admin
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has listings
    const checkListings = await pool.query('SELECT COUNT(*) FROM listings WHERE category_id = $1', [id]);
    if (parseInt(checkListings.rows[0].count, 10) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category containing listings. You can deactivate it instead.'
      });
    }

    await pool.query('DELETE FROM categories WHERE id = $1', [id]);

    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
