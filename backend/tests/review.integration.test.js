const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

jest.setTimeout(20000);

describe('Review API Full Integration Test', () => {

  beforeAll(async () => {
    console.log('Database ready for integration tests');
  });

  afterAll(async () => {
    await pool.query('DELETE FROM reviews'); // clean test data
    await pool.end();
    console.log('Database connection closed');
  });

  let createdReviewId;

  // ✅ Test creating a valid review
  it('should create a new review', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({
        name: 'Maxwell',
        rating: 5,
        comment: 'Excellent product!'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdReviewId = res.body.id; // save for later tests
  });

  // ✅ Test creating an invalid review
  it('should fail to create a review with invalid data', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({
        name: '',          // invalid name
        rating: 10,        // invalid rating > 5
        comment: ''        // empty comment
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // ✅ Test fetching all reviews
  it('should fetch all reviews', async () => {
    const res = await request(app).get('/api/reviews');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(r => r.id === createdReviewId)).toBe(true);
  });

  // ✅ Test fetching a single review by ID
  it('should fetch a single review by ID', async () => {
    const res = await request(app).get(`/api/reviews/${createdReviewId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdReviewId);
  });

  // ✅ Test updating a review
  it('should update a review', async () => {
    const res = await request(app)
      .put(`/api/reviews/${createdReviewId}`)
      .send({
        rating: 4,
        comment: 'Good product'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('rating', 4);
    expect(res.body).toHaveProperty('comment', 'Good product');
  });

  // ✅ Test deleting a review
  it('should delete a review', async () => {
    const res = await request(app)
      .delete(`/api/reviews/${createdReviewId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Review deleted successfully');
  });

  // ✅ Test fetching deleted review
  it('should return 404 for deleted review', async () => {
    const res = await request(app).get(`/api/reviews/${createdReviewId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

});
