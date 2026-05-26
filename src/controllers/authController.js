const pool = require('../database/db');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// ─── Register or Login User ───────────────────────────────
// Called after Firebase OTP verification is successful
const registerUser = async (req, res) => {
  try {
    const { name, phone, fcm_token } = req.body;

    // Validate required fields
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );

    let user;

    if (existingUser.rows.length > 0) {
      // User exists — update FCM token and return existing user
      const updated = await pool.query(
        `UPDATE users 
         SET fcm_token = $1, updated_at = NOW() 
         WHERE phone = $2 
         RETURNING *`,
        [fcm_token, phone]
      );
      user = updated.rows[0];
    } else {
      // New user — create profile
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Name is required for new users'
        });
      }

      const newUser = await pool.query(
        `INSERT INTO users (name, phone, fcm_token, is_verified) 
         VALUES ($1, $2, $3, true) 
         RETURNING *`,
        [name, phone, fcm_token]
      );
      user = newUser.rows[0];
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: existingUser.rows.length > 0
        ? 'Login successful'
        : 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        profile_photo_url: user.profile_photo_url,
        is_verified: user.is_verified
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// ─── Get Current User ─────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, name, phone, email, profile_photo_url FROM users WHERE id = $1',
      [req.userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: user.rows[0]
    });

  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = { registerUser, getMe };