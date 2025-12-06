const Review = require('../models/Review');
const pool = require('../config/db'); // Add this import for direct queries

// Create a new review
exports.createReview = async (req, res, next) => {
  try {
    const { product_id, name, rating, comment } = req.body;

    // Validation
    if (!product_id || !name || !rating || !comment) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const id = await Review.create({ product_id, name, rating, comment });
    
    res.status(201).json({ 
      id, 
      product_id, 
      name, 
      rating, 
      comment,
      message: 'Review created successfully' 
    });
  } catch (err) {
    console.error('Error creating review:', err);
    next(err);
  }
};

// Fetch all reviews
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.getAll();
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching all reviews:', err);
    next(err);
  }
};

// Fetch all products with their ratings and review counts
exports.getProducts = async (req, res) => {
  try {
    const query = `
      SELECT 
        product_id as id,
        COUNT(*) as review_count,
        ROUND(AVG(rating)::numeric, 1) as avg_rating
      FROM reviews
      GROUP BY product_id
      ORDER BY product_id
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      message: 'Failed to fetch products',
      error: error.message 
    });
  }
};

// Fetch reviews for a specific product by product_id
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const reviews = await Review.getByProductId(productId);
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews by product:', error);
    res.status(500).json({ 
      message: 'Failed to fetch reviews for product',
      error: error.message 
    });
  }
};

// Fetch a single review by ID
exports.getReviewById = async (req, res, next) => {
  try {
    const review = await Review.getById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(review);
  } catch (err) {
    console.error('Error fetching review by ID:', err);
    next(err);
  }
};

// Update a review by ID
exports.updateReview = async (req, res, next) => {
  try {
    const { name, rating, comment } = req.body;
    
    if (!name || !rating || !comment) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const updatedReview = await Review.update(req.params.id, { name, rating, comment });
    
    if (!updatedReview) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(updatedReview);
  } catch (err) {
    console.error('Error updating review:', err);
    next(err);
  }
};

// Delete a review by ID
exports.deleteReview = async (req, res, next) => {
  try {
    const deleted = await Review.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    next(err);
  }
};