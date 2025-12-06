// routes/productRoutes.js
const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Get all products with avg rating and review count
router.get('/', async (req, res) => {
  try {
    const products = await pool.query(`
      SELECT p.id, p.name, p.price, p.image, p.description,
        COALESCE(AVG(r.rating),0) as avg_rating,
        COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN reviews r ON r.product_id = p.id
      GROUP BY p.id
    `);
    res.json(products.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single product with reviews
router.get('/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    const productRes = await pool.query('SELECT * FROM products WHERE id=$1', [productId]);
    const reviewsRes = await pool.query('SELECT * FROM reviews WHERE product_id=$1', [productId]);
    const product = productRes.rows[0];
    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json({
      ...product,
      reviews: reviewsRes.rows,
      avgRating: reviewsRes.rows.length ? reviewsRes.rows.reduce((sum,r)=>sum+r.rating,0)/reviewsRes.rows.length : 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
