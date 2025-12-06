const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

describe('Review API', () => {
  
  beforeAll(async () => {
    try {
      await pool.query("DELETE FROM reviews WHERE name = 'Maxwell'");
      console.log('Database ready for tests');
    } catch (error) {
      console.error('beforeAll error:', error);
    }
  }, 30000);

  afterAll(async () => {
    try {
      // Clean up test data
      await pool.query("DELETE FROM reviews WHERE name = 'Maxwell'");
      console.log('Test data cleaned up');
    } catch (error) {
      console.error('Cleanup error:', error);
    } finally {
      // Always close the pool, even if cleanup fails
      try {
        await pool.end();
        console.log('Database connection closed');
      } catch (err) {
        console.error('Error closing pool:', err);
      }
    }
  }, 30000);

  it('should create a new review', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({
        name: 'Maxwell',
        rating: 5,
        comment: 'Great product!',
        email: 'maxwell@test.com'
      });
    
    console.log('Create response:', res.statusCode, res.body);
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Maxwell');
    expect(res.body.rating).toBe(5);
  }, 30000);

  it('should fetch all reviews', async () => {
    const res = await request(app).get('/api/reviews');
    
    console.log('Fetch all response:', res.statusCode);
    
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  }, 30000);
});