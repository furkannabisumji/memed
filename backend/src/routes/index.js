const express = require('express');
const lensRoutes = require('./lensRoutes');

const router = express.Router();

// API welcome message
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to Memed API' });
});

// Mount routes
router.use('/api', lensRoutes);

module.exports = router; 