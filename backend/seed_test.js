const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function seed() {
  try {
    await pool.query(
      'INSERT INTO agent_memory (user_id, action, result, churn_risk, expected_churn, reason) VALUES ($1, $2, $3, $4, $5, $6)',
      ['user_001', 'MOCK_RETENTION_OFFER', 'accepted', 0.85, 0.15, 'Customer was flagged for high churn due to service quality complaints. A 20% discount was offered and accepted via automated agent.']
    );
    console.log('Seeded user_123 successfully');
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
