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
// AUTO-CREATE TABLES AND SEED PRODUCTS
// -------------------------------------------------------

async function initDB() {
  try {
    // Drop existing tables and recreate them
    await pool.query(`
      DROP TABLE IF EXISTS reviews CASCADE;
      DROP TABLE IF EXISTS products CASCADE;

      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL NOT NULL,
        image TEXT,
        description TEXT,
        category VARCHAR(255)
      );

      CREATE TABLE reviews (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Tables created successfully.");

    // Insert products matching your frontend data
    await pool.query(`
      INSERT INTO products (id, name, price, image, description, category) VALUES
      (1, 'African Shirts', 1700, 'assets/images/African-shirts from ksh1700.jpeg', 'Beautiful traditional African print shirts', 'shirts'),
      (2, 'Ankara Design Shirt', 3000, 'assets/images/Ankara-shirts from ksh 3000.jpeg', 'Stylish Ankara pattern shirt', 'shirts'),
      (3, 'Blouse & Skirt', 2000, 'assets/images/blouse&skirt from Ksh2000.jpeg', 'Elegant blouse and skirt set', 'sets'),
      (4, 'Cinderella Long Dress', 4000, 'assets/images/Cinderella-dress.jpeg', 'Beautiful long dress', 'dresses'),
      (5, 'Full-Length Abaya Kaftans', 2500, 'assets/images/Full-Length Abaya Kaftans from Ksh 2500.jpeg', 'Elegant full-length kaftans', 'kaftans'),
      (6, 'Heavy Duty Reflector Jackets', 1500, 'assets/images/Heavy -duty -reflector jackets from Ksh1500.jpeg', 'High-visibility safety jackets', 'jackets'),
      (7, 'Kaftan Suits', 4500, 'assets/images/Kaftan- suits from Ksh 4500.jpeg', 'Premium kaftan suits', 'suits'),
      (8, 'Kitenge Shirt', 2500, 'assets/images/kitenge-shirts from ksh 2500.jpeg', 'Traditional kitenge shirts', 'shirts'),
      (9, 'Ladies Official Jacket', 5000, 'assets/images/Ladies -official -Jacket from Ksh5000.jpeg', 'Professional ladies jacket', 'jackets'),
      (10, 'Official Kitenge Dress', 2000, 'assets/images/Official -Kitengedress from Ksh 2000.jpeg', 'Formal kitenge dress', 'dresses'),
      (11, 'Official Shirts', 2000, 'assets/images/Official -shirts from Ksh2000.jpeg', 'Professional office shirts', 'shirts'),
      (12, 'Official Skirt Suits', 5000, 'assets/images/official -skirt-suits from Ksh 5000.jpeg', 'Complete skirt suit set', 'suits'),
      (13, 'Official Shirt Dress', 1800, 'assets/images/Official-shirtdress from Ksh1800.jpeg', 'Stylish shirt dress', 'dresses'),
      (14, 'Princess Round Dress', 4000, 'assets/images/Princess-round dress from Ksh 4000.jpeg', 'Elegant princess dress', 'dresses'),
      (15, 'School Uniform', 1500, 'assets/images/School-unifrom  from Ksh 1500.jpeg', 'Quality school uniforms', 'uniforms'),
      (16, 'Shirt Dress', 1800, 'assets/images/Shirt -Dress from Ksh1800.jpeg', 'Casual shirt dress', 'dresses'),
      (17, 'Kids Wear', 1800, 'assets/images/Kids-wear.jpg', 'Quality children clothing', 'kids'),
      (18, 'Kitenge Bag', 1800, 'assets/images/kitenge-bag.jpeg', 'Stylish kitenge bags', 'accessories')
    `);

    console.log("Products seeded successfully! 18 products added.");

  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Run once on server start
initDB();

module.exports = pool;