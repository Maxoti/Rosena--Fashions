const { Pool } = require('pg');
const path = require('path');

// Load .env from the project root
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/rosena_reviews',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => console.log('Connected to PostgreSQL'));
pool.on('error', (err) => console.error('Unexpected error on idle client', err));


// -------------------------------------------------------
// AUTO-CREATE TABLES IN RENDER DATABASE IF THEY DON'T EXIST
// -------------------------------------------------------

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL NOT NULL,
        image TEXT,
        description TEXT,
        category VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        rating INT NOT NULL,
        comment TEXT
      );
    `);

    console.log("Tables ensured.");
  } catch (error) {
    console.error("Error ensuring tables:", error);
  }
}

// Run once on server start
initDB();


// -------------------------------------------------------
module.exports = pool;
