const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool
// A pool manages multiple database connections efficiently
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test the connection when server starts
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    return;
  }
  release();
  console.log('✅ Database connected successfully!');
});

module.exports = pool;