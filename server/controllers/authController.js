import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'demo_super_secret_jwt_key_yene_kiray_2026_change_me', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register new client (Strictly role: 'user')
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing email
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Fetch current system free trial limit configured by admin at registration time
    const settingRes = await pool.query(
      "SELECT setting_value FROM system_settings WHERE setting_key = 'free_trial_posts_count'"
    );
    let freeTrialLimit = 3;
    if (settingRes.rows.length > 0) {
      const parsed = parseInt(settingRes.rows[0].setting_value, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        freeTrialLimit = parsed;
      }
    }

    // Explicitly enforce role='user' and record the user's permanent initial free trial allowance
    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, role, is_active, free_trial_posts_remaining, has_unlimited_access)
       VALUES ($1, $2, $3, $4, 'user', true, $5, false)
       RETURNING id, name, email, phone, role, is_active, avatar_url, free_trial_posts_remaining, has_unlimited_access, created_at`,
      [name.trim(), normalizedEmail, phone || null, passwordHash, freeTrialLimit]
    );

    const newUser = result.rows[0];
    const token = generateToken(newUser.id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
};

// @desc    Login user / admin
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const userRes = await pool.query(
      'SELECT id, name, email, phone, password_hash, role, is_active, avatar_url, free_trial_posts_remaining, has_unlimited_access FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Your account is deactivated. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    // Remove password hash from response
    delete user.password_hash;

    return res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const userRes = await pool.query(
      'SELECT id, name, email, phone, role, is_active, avatar_url, bio, free_trial_posts_remaining, has_unlimited_access, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user: userRes.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, avatar_url } = req.body;

    const updateRes = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           bio = COALESCE($3, bio),
           avatar_url = COALESCE($4, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, name, email, phone, role, is_active, avatar_url, bio, created_at`,
      [name, phone, bio, avatar_url, req.user.id]
    );

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updateRes.rows[0]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
