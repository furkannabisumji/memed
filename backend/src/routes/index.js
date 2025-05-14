const express = require('express');
const lensRoutes = require('./lensRoutes');
const heatRoutes = require('./heat');

const router = express.Router();

// API welcome message
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to Memed API' });
});

// Mount routes
router.use('/api', lensRoutes);
router.use('/api/heat', heatRoutes);

module.exports = router; 