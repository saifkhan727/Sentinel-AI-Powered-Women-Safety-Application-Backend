# 🛡️ Sentinel — Backend Server

> Node.js + Express REST API & WebSocket server for the
> Sentinel Women Safety Application

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![WebSocket](https://img.shields.io/badge/WebSocket-ws-yellow)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🚀 Features

- JWT-based authentication with Firebase Phone OTP
- Guardian Circle management (up to 5 contacts)
- SOS trigger + logging system
- Real-time live location via WebSocket
- Firebase FCM push notifications to guardians
- Safe places proxy API
- WebSocket server for real-time location broadcasting

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18.x |
| Framework | Express.js |
| Database | PostgreSQL |
| Real-time | WebSocket (ws library) |
| Auth | Firebase Admin SDK + JWT |
| Notifications | Firebase FCM |
| Driver | pg (node-postgres) |

---

## 📁 Project Structure

```
sentinel_backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── guardianController.js
│   │   ├── locationController.js
│   │   ├── sosController.js
│   │   └── safePlacesController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── guardianRoutes.js
│   │   ├── locationRoutes.js
│   │   ├── sosRoutes.js
│   │   └── safePlacesRoutes.js
│   ├── services/
│   │   ├── firebaseService.js
│   │   └── twilioService.js
│   ├── database/
│   │   └── db.js
│   └── index.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /auth/register | Register new user |
| GET | /auth/me | Get current user |

### Guardians
| Method | Endpoint | Description |
|---|---|---|
| GET | /guardians | Get all guardians |
| POST | /guardians | Add guardian |
| DELETE | /guardians/:id | Remove guardian |

### SOS
| Method | Endpoint | Description |
|---|---|---|
| POST | /sos/trigger | Trigger SOS alert |
| GET | /sos/history | Get SOS history |

### Location
| Method | Endpoint | Description |
|---|---|---|
| POST | /location/start | Start sharing session |
| POST | /location/update | Update location |
| POST | /location/stop | Stop sharing |
| GET | /location/active | Get active session |

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Firebase project with Admin SDK

### 1. Clone the repository
```
git clone https://github.com/saifkhan727/Sentinel-AI-Powered-Women-Safety-Application.git
cd Sentinel-AI-Powered-Women-Safety-Application
```

### 2. Install dependencies
```
npm install
```

### 3. Create environment file
Create .env file:
```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/sentinel_db
JWT_SECRET=your_jwt_secret_here
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

### 4. Add Firebase service account
Place your firebase-service-account.json in the root directory.
Get this from: Firebase Console → Project Settings → Service Accounts → Generate new private key

### 5. Setup PostgreSQL database
```
createdb sentinel_db
```

### 6. Run the server
```
# Development
npm run dev

# Production
npm start
```

Server runs on: http://localhost:3000
WebSocket runs on: ws://localhost:3000

---

## 🔐 Environment Variables

```
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_here
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

---

## ⚠️ Security Notes

- Never commit .env or firebase-service-account.json
- Rotate JWT secret regularly
- Use HTTPS in production
- Enable PostgreSQL SSL in production

---

## 👨‍💻 Developer
**Saif Akhtar Khan**


🔗 Flutter App Repo: https://github.com/saifkhan727/Sentinel-Frontend

---

## 📄 License

This project is licensed under the MIT License.
