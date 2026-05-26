// const axios = require('axios');
// require('dotenv').config();

// // ─── Send Single SMS via Fast2SMS ─────────────────────────
// const sendSMS = async ({ to, message }) => {
//   try {
//     if (
//       !process.env.FAST2SMS_API_KEY ||
//       process.env.FAST2SMS_API_KEY === 'your_fast2sms_key_here'
//     ) {
//       console.log('⚠️ Fast2SMS not configured');
//       console.log(`📱 Would send to ${to}: ${message}`);
//       return { success: false, reason: 'not_configured' };
//     }

//     // Remove country code
//     const phoneNumber = to
//       .replace('+91', '')
//       .replace('+', '')
//       .trim();

//     console.log(`📤 Sending to: ${phoneNumber}`);

//     const response = await axios({
//       method: 'GET',
//       url: 'https://www.fast2sms.com/dev/wallet?authorization',
//       headers: {
//         authorization: process.env.FAST2SMS_API_KEY,
//       },
//       params: {
//         route: 'q',
//         message: message,
//         language: 'english',
//         flash: 0,
//         numbers: phoneNumber,
//       },
//     });

//     console.log('Fast2SMS response:', response.data);

//     if (response.data.return === true) {
//       console.log(`✅ SMS sent to ${to}`);
//       return { success: true };
//     } else {
//       console.log(`❌ SMS failed:`, response.data);
//       return { success: false, error: JSON.stringify(response.data) };
//     }

//   } catch (error) {
//     console.error(`❌ SMS failed to ${to}:`, error.message);
//     if (error.response) {
//       console.error('Error details:', error.response.data);
//     }
//     return { success: false, error: error.message };
//   }
// };

// // ─── Send SOS SMS to All Guardians ───────────────────────
// const sendSOSSMS = async ({
//   guardians,
//   userName,
//   userPhone,
//   latitude,
//   longitude
// }) => {
//   const mapsLink =
//     `https://maps.google.com/?q=${latitude},${longitude}`;

//   const message =
// `EMERGENCY ALERT - SENTINEL

// ${userName} needs immediate help!

// Live Location:
// ${mapsLink}

// Their number: ${userPhone}

// Please call them or go to their location immediately.

// This is an automated emergency alert from Sentinel Women Safety App.`;

//   console.log(`📤 Sending SOS SMS to ${guardians.length} guardians...`);

//   const results = await Promise.allSettled(
//     guardians.map(guardian =>
//       sendSMS({
//         to: guardian.contact_phone,
//         message,
//       })
//     )
//   );

//   results.forEach((result, index) => {
//     const guardian = guardians[index];
//     if (result.status === 'fulfilled' && result.value.success) {
//       console.log(`✅ SMS delivered to ${guardian.contact_name}`);
//     } else {
//       console.log(`❌ SMS failed to ${guardian.contact_name}`);
//     }
//   });

//   return results;
// };

// module.exports = { sendSMS, sendSOSSMS };





require('dotenv').config();

// ─── SMS Service (Disabled for now) ──────────────────────
// SMS will be integrated after app is complete

const sendSMS = async ({ to, message }) => {
  // SMS temporarily disabled
  console.log(`📱 SMS skipped (not configured) to ${to}`);
  return { success: false, reason: 'sms_disabled' };
};

const sendSOSSMS = async ({ guardians, userName, userPhone, latitude, longitude }) => {
  console.log(`📱 SMS alerts skipped — ${guardians.length} guardians`);
  console.log(`📍 Location: ${latitude}, ${longitude}`);
  console.log(`👤 User: ${userName} (${userPhone})`);
  return [];
};

const sendSafeSMS = async ({ guardians, userName }) => {
  console.log(`📱 Safe SMS skipped for ${guardians.length} guardians`);
  return [];
};

module.exports = { sendSMS, sendSOSSMS, sendSafeSMS };