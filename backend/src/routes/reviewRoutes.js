const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// IMPORTANT: Specific routes MUST come BEFORE generic routes with parameters

// Create a new review
router.post('/', reviewController.createReview);

// Fetch all reviews
router.get('/', reviewController.getReviews);

// Fetch all products with ratings (MUST be before /:id route)
router.get('/products', reviewController.getProducts);

// Fetch reviews for a specific product (MUST be before /:id route)
router.get('/product/:productId', reviewController.getReviewsByProduct);

// Fetch a single review by ID (MUST be AFTER specific routes)
router.get('/:id', reviewController.getReviewById);

// Update a review by ID
router.put('/:id', reviewController.updateReview);

// Delete a review by ID
router.delete('/:id', reviewController.deleteReview);

module.exports = router;