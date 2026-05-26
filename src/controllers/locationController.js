const pool = require('../database/db');
const { v4: uuidv4 } = require('uuid');

// ─── Start Location Session ───────────────────────────────
const startSession = async (req, res) => {
  try {
    const { latitude, longitude, duration_minutes } = req.body;

    // Generate unique share token
    const shareToken = uuidv4().replace(/-/g, '').substring(0, 16);

    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + (duration_minutes || 60)
    );

    // Create session
    const result = await pool.query(
      `INSERT INTO location_sessions 
       (user_id, share_token, latitude, longitude, 
        is_active, expires_at)
       VALUES ($1, $2, $3, $4, true, $5)
       RETURNING *`,
      [
        req.userId,
        shareToken,
        latitude || 0,
        longitude || 0,
        expiresAt,
      ]
    );

    const session = result.rows[0];

    console.log(`📍 Location session started: ${session.id}`);

    return res.status(201).json({
      success: true,
      message: 'Location sharing started',
      session: {
        id: session.id,
        shareToken: session.share_token,
        expiresAt: session.expires_at,
      }
    });

  } catch (error) {
    console.error('Start session error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start location session'
    });
  }
};

// ─── Update Location ──────────────────────────────────────
const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, sessionId } = req.body;

    await pool.query(
      `UPDATE location_sessions 
       SET latitude = $1, longitude = $2
       WHERE id = $3 AND user_id = $4 AND is_active = true`,
      [latitude, longitude, sessionId, req.userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Location updated'
    });

  } catch (error) {
    console.error('Update location error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update location'
    });
  }
};

// ─── Stop Location Session ────────────────────────────────
const stopSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    await pool.query(
      `UPDATE location_sessions 
       SET is_active = false
       WHERE id = $1 AND user_id = $2`,
      [sessionId, req.userId]
    );

    console.log(`📍 Location session stopped: ${sessionId}`);

    return res.status(200).json({
      success: true,
      message: 'Location sharing stopped'
    });

  } catch (error) {
    console.error('Stop session error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to stop session'
    });
  }
};

// ─── Get Active Session ───────────────────────────────────
const getActiveSession = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM location_sessions 
       WHERE user_id = $1 
       AND is_active = true 
       AND expires_at > NOW()
       ORDER BY started_at DESC 
       LIMIT 1`,
      [req.userId]
    );

    return res.status(200).json({
      success: true,
      session: result.rows[0] || null
    });

  } catch (error) {
    console.error('Get session error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get session'
    });
  }
};

// ─── Track Location (Public - for guardians) ──────────────
const trackLocation = async (req, res) => {
  try {
    const { token } = req.params;

    const result = await pool.query(
      `SELECT ls.*, u.name as user_name, u.phone as user_phone
       FROM location_sessions ls
       JOIN users u ON ls.user_id = u.id
       WHERE ls.share_token = $1 
       AND ls.is_active = true
       AND ls.expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Location session not found or expired'
      });
    }

    return res.status(200).json({
      success: true,
      location: result.rows[0]
    });

  } catch (error) {
    console.error('Track location error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get location'
    });
  }
};

module.exports = {
  startSession,
  updateLocation,
  stopSession,
  getActiveSession,
  trackLocation
};