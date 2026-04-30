const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function findUser() {
  try {
    const res = await pool.query('SELECT user_id FROM users LIMIT 1');
    if (res.rows.length > 0) {
      console.log('VALID_USER_ID:' + res.rows[0].user_id);
    } else {
      console.log('NO_USERS_FOUND');
    }
  } catch (err) {
    console.error('Query failed:', err.message);
  } finally {
    await pool.end();
  }
}

findUser();
