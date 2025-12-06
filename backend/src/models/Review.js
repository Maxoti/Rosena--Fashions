const pool = require('../config/db');

const Review = {
  // Create a new review
  create: async ({ name, rating, comment, product_id }) => {
    const query = `
      INSERT INTO reviews (name, rating, comment, product_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const values = [name, rating, comment, product_id];
    const res = await pool.query(query, values);
    return res.rows[0].id;
  },

  // Get all reviews
  getAll: async () => {
    const query = `SELECT * FROM reviews ORDER BY id DESC`;
    const res = await pool.query(query);
    return res.rows;
  },

  // Get a review by its ID
  getById: async (id) => {
    const query = `SELECT * FROM reviews WHERE id = $1`;
    const res = await pool.query(query, [id]);
    return res.rows[0];
  },

  // Update a review by ID
  update: async (id, { name, rating, comment }) => {
    const query = `
      UPDATE reviews
      SET name = $1, rating = $2, comment = $3
      WHERE id = $4
      RETURNING *
    `;
    const values = [name, rating, comment, id];
    const res = await pool.query(query, values);
    return res.rows[0];
  },

  // Delete a review by ID
  delete: async (id) => {
    const query = `DELETE FROM reviews WHERE id = $1 RETURNING *`;
    const res = await pool.query(query, [id]);
    return res.rows[0];
  },

  // Get reviews for a specific product by ID
  getByProductId: async (productId) => {
    const query = `
      SELECT * 
      FROM reviews 
      WHERE product_id = $1
      ORDER BY id DESC
    `;
    const res = await pool.query(query, [productId]);
    return res.rows;
  },

  // Get reviews for a specific product by name (requires JOIN with products table)
 getByProductName: async (productName) => {
  const query = `
    SELECT r.* 
    FROM reviews r
    JOIN products p ON r.product_id = p.id
    WHERE p.name ILIKE $1
    ORDER BY r.id DESC
  `;
  const res = await pool.query(query, [`%${productName}%`]); // % allows partial match
  return res.rows;
}

};

module.exports = Review;
