const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('CRITICAL ERROR: DATABASE_URL is not defined in .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased to 10 seconds
  ssl: {
    rejectUnauthorized: false // Often needed for cloud DBs if certs aren't local
  }
});

// Handle pool errors to prevent process crashes
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

// Test connection with retry
const connectWithRetry = () => {
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Error connecting to the PostgreSQL database:', err.message);
      console.log('Retrying in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log('PostgreSQL database connected successfully');
    }
  });
};

connectWithRetry();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};


