const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  const serviceAccount = require(
    path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('✅ Firebase Admin initialized');
}

// ─── Send FCM Notification ────────────────────────────────
const sendPushNotification = async ({
  fcmToken,
  title,
  body,
  data = {}
}) => {
  try {
    if (!fcmToken) {
      console.log('⚠️ No FCM token provided');
      return false;
    }

    const message = {
      token: fcmToken,
      notification: { title, body },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          priority: 'max',
          channelId: 'sentinel_sos',
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log(`✅ FCM sent successfully: ${response}`);
    return true;

  } catch (error) {
    console.error('❌ FCM send error:', error.message);
    return false;
  }
};

// ─── Send to Multiple Tokens ──────────────────────────────
const sendToMultiple = async ({ fcmTokens, title, body, data = {} }) => {
  const results = await Promise.all(
    fcmTokens.map(token =>
      sendPushNotification({ fcmToken: token, title, body, data })
    )
  );
  return results;
};

module.exports = { sendPushNotification, sendToMultiple };