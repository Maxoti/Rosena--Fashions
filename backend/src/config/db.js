const { Pool } = require('pg');
const path = require('path');

// Load .env from the root directory
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });

require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/rosena_reviews',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => console.log('Connected to PostgreSQL'));
pool.on('error', (err) => console.error('Unexpected error on idle client', err));

module.exports = pool;

