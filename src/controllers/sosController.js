// const pool = require('../database/db');
// const { sendPushNotification } = require('../services/firebaseService');
// const { sendSOSSMS } = require('../services/twilioService');

// // ─── Trigger SOS ──────────────────────────────────────────
// const triggerSOS = async (req, res) => {
//   try {
//     const {
//       latitude,
//       longitude,
//       address,
//       trigger_type,
//       evidence_photo_url
//     } = req.body;

//     // Get user details
//     const userResult = await pool.query(
//       'SELECT * FROM users WHERE id = $1',
//       [req.userId]
//     );

//     if (userResult.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     const user = userResult.rows[0];

//     // Create SOS alert in database
//     const sosResult = await pool.query(
//       `INSERT INTO sos_alerts 
//        (user_id, trigger_type, latitude, longitude, address, 
//         status, evidence_photo_url)
//        VALUES ($1, $2, $3, $4, $5, 'active', $6)
//        RETURNING *`,
//       [
//         req.userId,
//         trigger_type || 'manual',
//         latitude,
//         longitude,
//         address || 'Unknown location',
//         evidence_photo_url || null
//       ]
//     );

//     const sosAlert = sosResult.rows[0];

//     // Get all guardians
//     const guardiansResult = await pool.query(
//       `SELECT * FROM guardian_contacts 
//        WHERE user_id = $1 
//        ORDER BY priority_order ASC`,
//       [req.userId]
//     );

//     const guardians = guardiansResult.rows;

//     if (guardians.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: 'SOS triggered but no guardians found',
//         sos: sosAlert,
//         notified: 0
//       });
//     }

//     const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;

//     // ── Send FCM to all guardians ──────────────────────
//     const guardianUserIds = guardians.map(g => g.user_id);

//     // Get FCM tokens of guardians (if they use the app)
//     const guardianPhones = guardians.map(g => g.contact_phone);
//     const fcmResult = await pool.query(
//       `SELECT fcm_token FROM users 
//        WHERE phone = ANY($1) AND fcm_token IS NOT NULL`,
//       [guardianPhones]
//     );

//     // Send FCM notifications
//     const fcmPromises = fcmResult.rows.map(row =>
//       sendPushNotification({
//         fcmToken: row.fcm_token,
//         title: `🚨 SOS Alert — ${user.name} needs help!`,
//         body: `${user.name} has triggered an emergency SOS. Tap to see location.`,
//         data: {
//           type: 'SOS_ALERT',
//           userId: req.userId,
//           sosId: sosAlert.id,
//           latitude: String(latitude),
//           longitude: String(longitude),
//           mapsLink,
//         },
//       })
//     );

//     // Send SMS to ALL guardians (doesn't require app)
//     const smsPromise = sendSOSSMS({
//       guardians,
//       userName: user.name,
//       latitude,
//       longitude,
//     });

//     // Run all notifications in parallel
//     await Promise.all([...fcmPromises, smsPromise]);

//     console.log(`🚨 SOS triggered by ${user.name} — ${guardians.length} guardians notified`);

//     return res.status(200).json({
//       success: true,
//       message: 'SOS triggered successfully',
//       sos: sosAlert,
//       notified: guardians.length,
//       guardians: guardians.map(g => ({
//         name: g.contact_name,
//         phone: g.contact_phone,
//       }))
//     });

//   } catch (error) {
//     console.error('SOS trigger error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to trigger SOS',
//       error: error.message
//     });
//   }
// };

// // // ─── Resolve SOS ──────────────────────────────────────────
// // const resolveSOS = async (req, res) => {
// //   try {
// //     const { id } = req.params;

// //     const result = await pool.query(
// //       `UPDATE sos_alerts 
// //        SET status = 'resolved', resolved_at = NOW()
// //        WHERE id = $1 AND user_id = $2
// //        RETURNING *`,
// //       [id, req.userId]
// //     );

// //     if (result.rows.length === 0) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'SOS alert not found'
// //       });
// //     }

// //     return res.status(200).json({
// //       success: true,
// //       message: 'SOS resolved successfully',
// //       sos: result.rows[0]
// //     });

// //   } catch (error) {
// //     console.error('Resolve SOS error:', error);
// //     return res.status(500).json({
// //       success: false,
// //       message: 'Internal server error'
// //     });
// //   }
// // };

// const resolveSOS = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const result = await pool.query(
//       `UPDATE sos_alerts 
//        SET status = 'resolved', resolved_at = NOW()
//        WHERE id = $1 AND user_id = $2
//        RETURNING *`,
//       [id, req.userId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'SOS alert not found'
//       });
//     }

//     // Get user details
//     const userResult = await pool.query(
//       'SELECT * FROM users WHERE id = $1',
//       [req.userId]
//     );

//     const user = userResult.rows[0];

//     // Get all guardians
//     const guardiansResult = await pool.query(
//       `SELECT * FROM guardian_contacts 
//        WHERE user_id = $1 
//        ORDER BY priority_order ASC`,
//       [req.userId]
//     );

//     const guardians = guardiansResult.rows;

//     // Send "I'm Safe" SMS to all guardians
//     if (twilioService && guardians.length > 0) {
//       try {
//         const safeMessage =
// `✅ SAFE ALERT - SENTINEL

// ${user.name} is now SAFE!

// The emergency SOS has been cancelled. 
// ${user.name} has confirmed they are safe and okay.

// Thank you for your concern.
// - Sentinel Women Safety App`;

//         await Promise.all(
//           guardians.map(guardian =>
//             twilioService.sendSMS({
//               to: guardian.contact_phone,
//               message: safeMessage,
//             })
//           )
//         );
//         console.log(`✅ Safe SMS sent to ${guardians.length} guardians`);
//       } catch (smsError) {
//         console.log('⚠️ Safe SMS failed:', smsError.message);
//       }
//     }

//     // Send FCM safe notification
//     if (firebaseService && guardians.length > 0) {
//       try {
//         const guardianPhones = guardians.map(g => g.contact_phone);
//         const fcmResult = await pool.query(
//           `SELECT fcm_token FROM users 
//            WHERE phone = ANY($1) AND fcm_token IS NOT NULL`,
//           [guardianPhones]
//         );

//         await Promise.all(
//           fcmResult.rows.map(row =>
//             firebaseService.sendPushNotification({
//               fcmToken: row.fcm_token,
//               title: `✅ ${user.name} is Safe!`,
//               body: 'The emergency SOS has been cancelled. They are safe now.',
//               data: { type: 'SOS_RESOLVED' },
//             })
//           )
//         );
//       } catch (fcmError) {
//         console.log('⚠️ Safe FCM failed:', fcmError.message);
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'SOS resolved and guardians notified',
//       sos: result.rows[0]
//     });

//   } catch (error) {
//     console.error('Resolve SOS error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// // ─── Get SOS History ──────────────────────────────────────
// const getSOSHistory = async (req, res) => {
//   try {
//     const result = await pool.query(
//       `SELECT * FROM sos_alerts 
//        WHERE user_id = $1 
//        ORDER BY created_at DESC 
//        LIMIT 20`,
//       [req.userId]
//     );

//     return res.status(200).json({
//       success: true,
//       history: result.rows
//     });

//   } catch (error) {
//     console.error('SOS history error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// module.exports = { triggerSOS, resolveSOS, getSOSHistory };





const pool = require('../database/db');

// ─── Load Services Safely ─────────────────────────────────
const firebaseService = (() => {
  try {
    return require('../services/firebaseService');
  } catch (e) {
    console.log('⚠️ Firebase not loaded:', e.message);
    return null;
  }
})();

const twilioService = (() => {
  try {
    return require('../services/twilioService');
  } catch (e) {
    console.log('⚠️ Twilio not loaded:', e.message);
    return null;
  }
})();

// ─── Trigger SOS ──────────────────────────────────────────
const triggerSOS = async (req, res) => {
  try {
    console.log('🚨 SOS trigger received from userId:', req.userId);

    const {
      latitude,
      longitude,
      address,
      trigger_type,
      evidence_photo_url
    } = req.body;

    console.log(`📍 Location: ${latitude}, ${longitude}`);

    // Get user details
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];
    console.log(`👤 User: ${user.name}`);

    // Create SOS alert in database
    const sosResult = await pool.query(
      `INSERT INTO sos_alerts 
       (user_id, trigger_type, latitude, longitude, address, 
        status, evidence_photo_url)
       VALUES ($1, $2, $3, $4, $5, 'active', $6)
       RETURNING *`,
      [
        req.userId,
        trigger_type || 'manual',
        latitude || 0,
        longitude || 0,
        address || 'Unknown location',
        evidence_photo_url || null
      ]
    );

    const sosAlert = sosResult.rows[0];
    console.log(`✅ SOS saved to DB: ${sosAlert.id}`);

    // Get all guardians
    const guardiansResult = await pool.query(
      `SELECT * FROM guardian_contacts 
       WHERE user_id = $1 
       ORDER BY priority_order ASC`,
      [req.userId]
    );

    const guardians = guardiansResult.rows;
    console.log(`👥 Found ${guardians.length} guardians`);

    if (guardians.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'SOS triggered but no guardians found',
        sos: sosAlert,
        notified: 0,
        guardians: []
      });
    }

    const mapsLink =
      `https://maps.google.com/?q=${latitude},${longitude}`;

    // ── Send SMS to all guardians ──────────────────────
    if (twilioService) {
      try {
        await twilioService.sendSOSSMS({
          guardians,
          userName: user.name,
          userPhone: user.phone,
          latitude: latitude || 0,
          longitude: longitude || 0,
        });
      } catch (smsError) {
        console.log('⚠️ SMS failed:', smsError.message);
      }
    }

    // ── Send FCM to guardians who have app ─────────────
    if (firebaseService) {
      try {
        const guardianPhones = guardians.map(g => g.contact_phone);
        const fcmResult = await pool.query(
          `SELECT fcm_token FROM users 
           WHERE phone = ANY($1) AND fcm_token IS NOT NULL`,
          [guardianPhones]
        );

        await Promise.all(
          fcmResult.rows.map(row =>
            firebaseService.sendPushNotification({
              fcmToken: row.fcm_token,
              title: `🚨 SOS — ${user.name} needs help!`,
              body: `${user.name} triggered emergency SOS. Tap to see location.`,
              data: {
                type: 'SOS_ALERT',
                mapsLink,
              },
            })
          )
        );
      } catch (fcmError) {
        console.log('⚠️ FCM failed:', fcmError.message);
      }
    }

    console.log(
      `🚨 SOS complete — ${guardians.length} guardians notified`
    );

    return res.status(200).json({
      success: true,
      message: 'SOS triggered successfully',
      sos: sosAlert,
      notified: guardians.length,
      userName: user.name,
      userPhone: user.phone,
      guardians: guardians.map(g => ({
        name: g.contact_name,
        phone: g.contact_phone,
      }))
    });

  } catch (error) {
    console.error('❌ SOS trigger error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to trigger SOS: ' + error.message
    });
  }
};

// ─── Resolve SOS ──────────────────────────────────────────
const resolveSOS = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE sos_alerts 
       SET status = 'resolved', resolved_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'SOS alert not found'
      });
    }

    // Get user details
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.userId]
    );

    const user = userResult.rows[0];

    // Get all guardians
    const guardiansResult = await pool.query(
      `SELECT * FROM guardian_contacts 
       WHERE user_id = $1 
       ORDER BY priority_order ASC`,
      [req.userId]
    );

    const guardians = guardiansResult.rows;

    // ── Send "I'm Safe" SMS to all guardians ───────────
    if (twilioService && guardians.length > 0) {
      try {
        const safeMessage =
`✅ SAFE ALERT - SENTINEL

${user.name} is now SAFE!

The emergency SOS has been cancelled.
${user.name} has confirmed they are safe and okay.

Thank you for your concern.
- Sentinel Women Safety App`;

        await Promise.all(
          guardians.map(guardian =>
            twilioService.sendSMS({
              to: guardian.contact_phone,
              message: safeMessage,
            })
          )
        );
        console.log(
          `✅ Safe SMS sent to ${guardians.length} guardians`
        );
      } catch (smsError) {
        console.log('⚠️ Safe SMS failed:', smsError.message);
      }
    }

    // ── Send FCM safe notification ─────────────────────
    if (firebaseService && guardians.length > 0) {
      try {
        const guardianPhones = guardians.map(g => g.contact_phone);
        const fcmResult = await pool.query(
          `SELECT fcm_token FROM users 
           WHERE phone = ANY($1) AND fcm_token IS NOT NULL`,
          [guardianPhones]
        );

        await Promise.all(
          fcmResult.rows.map(row =>
            firebaseService.sendPushNotification({
              fcmToken: row.fcm_token,
              title: `✅ ${user.name} is Safe!`,
              body: 'The emergency SOS has been cancelled. They are safe now.',
              data: { type: 'SOS_RESOLVED' },
            })
          )
        );
      } catch (fcmError) {
        console.log('⚠️ Safe FCM failed:', fcmError.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'SOS resolved and guardians notified',
      sos: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Resolve SOS error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ─── Get SOS History ──────────────────────────────────────
const getSOSHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM sos_alerts 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [req.userId]
    );

    return res.status(200).json({
      success: true,
      history: result.rows
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = { triggerSOS, resolveSOS, getSOSHistory };