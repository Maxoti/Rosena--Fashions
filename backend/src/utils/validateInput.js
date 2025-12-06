exports.validateReview = (data) => {
  const { name, rating, comment } = data;
  if (!name || !rating || !comment) return false;
  if (rating < 1 || rating > 5) return false;
  return true;
};
