const Review = require('../models/Review');
const { validateReview } = require('../utils/validateInput');

exports.addReview = (data, callback) => {
  if (!validateReview(data)) {
    return callback({ message: 'Invalid review data' });
  }
  Review.create(data, callback);
};
