const pool = require('../database/db');

// ─── Get All Guardians ────────────────────────────────────
const getGuardians = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM guardian_contacts 
       WHERE user_id = $1 
       ORDER BY priority_order ASC`,
      [req.userId]
    );

    return res.status(200).json({
      success: true,
      guardians: result.rows
    });

  } catch (error) {
    console.error('Get guardians error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ─── Add Guardian ─────────────────────────────────────────
const addGuardian = async (req, res) => {
  try {
    const { contact_name, contact_phone, priority_order } = req.body;

    // Validate fields
    if (!contact_name || !contact_phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required'
      });
    }

    // Check max 5 guardians limit
    const count = await pool.query(
      'SELECT COUNT(*) FROM guardian_contacts WHERE user_id = $1',
      [req.userId]
    );

    if (parseInt(count.rows[0].count) >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 guardians allowed'
      });
    }

    // Check duplicate phone
    const duplicate = await pool.query(
      `SELECT * FROM guardian_contacts 
       WHERE user_id = $1 AND contact_phone = $2`,
      [req.userId, contact_phone]
    );

    if (duplicate.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already in your guardian circle'
      });
    }

    // Add guardian
    const result = await pool.query(
      `INSERT INTO guardian_contacts 
       (user_id, contact_name, contact_phone, priority_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.userId, contact_name, contact_phone, priority_order || 1]
    );

    return res.status(201).json({
      success: true,
      message: 'Guardian added successfully',
      guardian: result.rows[0]
    });

  } catch (error) {
    console.error('Add guardian error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ─── Update Guardian ──────────────────────────────────────
const updateGuardian = async (req, res) => {
  try {
    const { id } = req.params;
    const { contact_name, contact_phone, priority_order } = req.body;

    // Make sure guardian belongs to this user
    const existing = await pool.query(
      `SELECT * FROM guardian_contacts 
       WHERE id = $1 AND user_id = $2`,
      [id, req.userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Guardian not found'
      });
    }

    const result = await pool.query(
      `UPDATE guardian_contacts 
       SET contact_name = $1, 
           contact_phone = $2, 
           priority_order = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [contact_name, contact_phone, priority_order, id, req.userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Guardian updated successfully',
      guardian: result.rows[0]
    });

  } catch (error) {
    console.error('Update guardian error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ─── Delete Guardian ──────────────────────────────────────
const deleteGuardian = async (req, res) => {
  try {
    const { id } = req.params;

    // Make sure guardian belongs to this user
    const existing = await pool.query(
      `SELECT * FROM guardian_contacts 
       WHERE id = $1 AND user_id = $2`,
      [id, req.userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Guardian not found'
      });
    }

    await pool.query(
      'DELETE FROM guardian_contacts WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Guardian removed successfully'
    });

  } catch (error) {
    console.error('Delete guardian error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getGuardians,
  addGuardian,
  updateGuardian,
  deleteGuardian
};