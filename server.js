require('dotenv').config();
// Import necessary dependencies
const mongoose = require('mongoose');
const express = require('express');

// Create an ExpressJS application
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Import all routes
const welcomeRoute = require('./routes/welcomeRoute');
const routes = require('./routes');

// Mount all the combined routes with versioned RESTful API prefix
app.use('/', welcomeRoute);
app.use('/api/v1', routes);

// Get MongoDB URI and port from environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

// Connect to MongoDB and start the server only if successful
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully to the PayFlow database.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });