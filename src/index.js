// const express = require('express');
// const cors = require('cors');
// const http = require('http');
// require('dotenv').config();

// const pool = require('./database/db');
// const authRoutes = require('./routes/authRoutes');
// const guardianRoutes = require('./routes/guardianRoutes');
// const sosRoutes = require('./routes/sosRoutes');

// const app = express();
// const server = http.createServer(app);

// // ─── Middleware ───────────────────────────────────────────
// app.use(cors());
// app.use(express.json());

// // ─── Routes ───────────────────────────────────────────────
// app.use('/api/auth', authRoutes);
// app.use('/api/guardians', guardianRoutes);
// app.use('/api/sos', sosRoutes);

// // ─── Test Route ───────────────────────────────────────────
// app.get('/', (req, res) => {
//   res.json({
//     message: '🛡️ Sentinel Backend is Running!',
//     version: '1.0.0',
//     status: 'healthy'
//   });
// });

// // ─── Database Test ────────────────────────────────────────
// app.get('/test-db', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT NOW() as current_time');
//     res.json({
//       message: '✅ Database is connected!',
//       time: result.rows[0].current_time
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: '❌ Database connection failed',
//       error: error.message
//     });
//   }
// });

// // ─── Start Server ─────────────────────────────────────────
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`🚀 Sentinel server running on port ${PORT}`);
//   console.log(`🌐 Visit: http://localhost:${PORT}`);
// });








// const express = require('express');
// const cors = require('cors');
// const http = require('http');
// const WebSocket = require('ws');
// require('dotenv').config();

// const pool = require('./database/db');
// const authRoutes = require('./routes/authRoutes');
// const guardianRoutes = require('./routes/guardianRoutes');
// const sosRoutes = require('./routes/sosRoutes');
// const locationRoutes = require('./routes/locationRoutes');

// const app = express();
// const server = http.createServer(app);

// // ─── WebSocket Server ─────────────────────────────────────
// const wss = new WebSocket.Server({ server });

// // Store active connections
// // Map of userId → WebSocket connection
// const activeConnections = new Map();

// wss.on('connection', (ws, req) => {
//   console.log('🔌 New WebSocket connection');

//   ws.on('message', (data) => {
//     try {
//       const message = JSON.parse(data);
//       console.log('📨 WS Message:', message.type);

//       switch (message.type) {

//         // User registers their connection
//         case 'register':
//           activeConnections.set(message.userId, ws);
//           ws.userId = message.userId;
//           console.log(`✅ User ${message.userId} registered`);
//           ws.send(JSON.stringify({
//             type: 'registered',
//             message: 'Connected successfully'
//           }));
//           break;

//         // User sends location update
//         case 'location_update':
//           handleLocationUpdate(ws, message);
//           break;

//         default:
//           console.log('⚠️ Unknown message type:', message.type);
//       }
//     } catch (error) {
//       console.error('❌ WS message error:', error.message);
//     }
//   });

//   ws.on('close', () => {
//     if (ws.userId) {
//       activeConnections.delete(ws.userId);
//       console.log(`🔌 User ${ws.userId} disconnected`);
//     }
//   });

//   ws.on('error', (error) => {
//     console.error('❌ WS error:', error.message);
//   });
// });

// // ─── Handle Location Update ───────────────────────────────
// async function handleLocationUpdate(ws, message) {
//   try {
//     const { userId, latitude, longitude, sessionId } = message;

//     // Update location in database
//     await pool.query(
//       `UPDATE location_sessions 
//        SET latitude = $1, longitude = $2
//        WHERE id = $3 AND is_active = true`,
//       [latitude, longitude, sessionId]
//     );

//     // Broadcast to all guardians watching this user
//     activeConnections.forEach((guardianWs, guardianId) => {
//       if (
//         guardianWs !== ws &&
//         guardianWs.readyState === WebSocket.OPEN &&
//         guardianWs.watchingUserId === userId
//       ) {
//         guardianWs.send(JSON.stringify({
//           type: 'location_update',
//           userId,
//           latitude,
//           longitude,
//           timestamp: new Date().toISOString(),
//         }));
//       }
//     });

//   } catch (error) {
//     console.error('❌ Location update error:', error.message);
//   }
// }

// // Export for use in routes
// app.set('wss', wss);
// app.set('activeConnections', activeConnections);

// // ─── Middleware ───────────────────────────────────────────
// app.use(cors());
// app.use(express.json());

// // ─── Routes ───────────────────────────────────────────────
// app.use('/api/auth', authRoutes);
// app.use('/api/guardians', guardianRoutes);
// app.use('/api/sos', sosRoutes);
// app.use('/api/location', locationRoutes);

// // ─── Test Route ───────────────────────────────────────────
// app.get('/', (req, res) => {
//   res.json({
//     message: '🛡️ Sentinel Backend is Running!',
//     version: '1.0.0',
//     status: 'healthy'
//   });
// });

// // ─── Start Server ─────────────────────────────────────────
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`🚀 Sentinel server running on port ${PORT}`);
//   console.log(`🌐 Visit: http://localhost:${PORT}`);
//   console.log(`🔌 WebSocket ready`);
// });




const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const pool = require('./database/db');
const authRoutes = require('./routes/authRoutes');
const guardianRoutes = require('./routes/guardianRoutes');
const sosRoutes = require('./routes/sosRoutes');
const locationRoutes = require('./routes/locationRoutes');
const safePlacesRoutes = require('./routes/safePlacesRoutes');

const app = express();
const server = http.createServer(app);

// ─── WebSocket Server ─────────────────────────────────────
const wss = new WebSocket.Server({ server });
const activeConnections = new Map();

wss.on('connection', (ws, req) => {
  console.log('🔌 New WebSocket connection');

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'register':
          activeConnections.set(message.userId, ws);
          ws.userId = message.userId;
          ws.send(JSON.stringify({
            type: 'registered',
            message: 'Connected successfully'
          }));
          break;

        case 'location_update':
          handleLocationUpdate(ws, message);
          break;
      }
    } catch (error) {
      console.error('WS error:', error.message);
    }
  });

  ws.on('close', () => {
    if (ws.userId) {
      activeConnections.delete(ws.userId);
    }
  });
});

async function handleLocationUpdate(ws, message) {
  try {
    const { userId, latitude, longitude, sessionId } = message;

    await pool.query(
      `UPDATE location_sessions 
       SET latitude = $1, longitude = $2
       WHERE id = $3 AND is_active = true`,
      [latitude, longitude, sessionId]
    );

    activeConnections.forEach((guardianWs) => {
      if (
        guardianWs !== ws &&
        guardianWs.readyState === WebSocket.OPEN &&
        guardianWs.watchingUserId === userId
      ) {
        guardianWs.send(JSON.stringify({
          type: 'location_update',
          userId,
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        }));
      }
    });
  } catch (error) {
    console.error('Location update error:', error.message);
  }
}

app.set('wss', wss);
app.set('activeConnections', activeConnections);

// ─── Middleware ───────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/guardians', guardianRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/safe-places', safePlacesRoutes);

// ─── Test Route ───────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🛡️ Sentinel Backend is Running!',
    version: '1.0.0',
    status: 'healthy'
  });
});

// ─── Database Test ────────────────────────────────────────
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({
      message: '✅ Database is connected!',
      time: result.rows[0].current_time
    });
  } catch (error) {
    res.status(500).json({
      message: '❌ Database connection failed',
      error: error.message
    });
  }
});

// ─── Start Server ─────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Sentinel server running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket ready`);
});
