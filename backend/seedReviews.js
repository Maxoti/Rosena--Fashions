const pool = require('./src/config/db');

async function seed() {
  await pool.query(`
    INSERT INTO reviews (name, rating, comment) VALUES
    ('Alice', 5, 'Excellent!'),
    ('Bob', 4, 'Good product'),
    ('Charlie', 3, 'Average');
  `);
  console.log('Seed data inserted');
  await pool.end();
}

seed();
