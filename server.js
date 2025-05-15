// Load environment variables from .env file
require('dotenv').config();

// Import necessary dependencies and files
const mongoose = require('mongoose');
const express = require('express');

// Create an ExpressJS application
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Get MongoDB URI and port from environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

// Connect to MongoDB and start the server only if successful
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully to the PayFlow database');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });