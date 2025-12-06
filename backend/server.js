const app = require('./src/app');
const dotenv = require('dotenv');
const pool = require('./src/config/db'); // your PostgreSQL pool

dotenv.config();
const PORT = process.env.PORT || 5000;

// Test DB connection before starting server
pool.connect()
  .then(() => {
    console.log('PostgreSQL connected');
    app.listen(PORT, () => {
      console.log(`Rosena backend running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to PostgreSQL:', err);
  });
