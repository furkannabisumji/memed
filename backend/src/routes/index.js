const express = require('express');
const lensRoutes = require('./lensRoutes');
const heatRoutes = require('./heat');
const tokenRoutes = require('./tokenRoutes');
const webhookRoutes = require('./webhookRoutes');

const router = express.Router();

// API welcome message
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to Memed API' });
});

// Mount routes
router.use('/api', lensRoutes);
router.use('/api/heat', heatRoutes);
router.use('/api', tokenRoutes);
router.use('/api/webhook', webhookRoutes);
module.exports = router; 