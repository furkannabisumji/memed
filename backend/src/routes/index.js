const express = require('express');
const router = express.Router();

// Example route
router.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

module.exports = router; 