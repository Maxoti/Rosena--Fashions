const express = require('express');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const reviewRoutes = require('./routes/reviewRoutes');
const errorHandler = require('./middleware/errorHandler');
const productRoutes = require('./routes/productRoutes');

const app = express();

// CORS – Allow both localhost and 127.0.0.1
app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://rosena-fashions-1.onrender.com' // Add your Render URL
  ],
   methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(bodyParser.json());

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, '..', '..')));

// Serve frontend index.html correctly
app.get('/', (req, res) => {
  res.sendFile(
    path.join(__dirname, '..', '..', 'index.html') // Go up TWO folders to reach root
  );
});

// API routes
app.use('/api/reviews', reviewRoutes);
app.use('/api/products', productRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;