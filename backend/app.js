const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes and middleware
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');
const rewardScheduler = require('./src/schedulers/rewardScheduler');
const heatScheduler = require('./src/schedulers/heatScheduler');

// Import contract service to initialize WebSocket event listeners
const contractService = require('./src/services/contractService');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/memed')
  .then(() => {
    console.log('Connected to MongoDB');
    // Start schedulers after successful connection
    rewardScheduler.start();
    heatScheduler.start();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mount all routes
app.use('/', routes);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});