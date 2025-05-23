// Import JsonWebToken for token generation and verification
const jwt = require('jsonwebtoken');

// Import the user model
const User = require('../models/user');

const authorize = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists and starts with 'Bearer'
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res
      .status(401)
      .json({ message: 'Access Denied as no token is provided.' });
  }

  // Extract only the token from the Bearer token by splitting with empty space
  const token = authHeader.split(' ')[1];
  try {
    // Verify token using secret key from .env file
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists in DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Attach the user object to the request
    req.user = user;

    // Pass control to the next middleware or controller
    next();

    // Cash errors if exist and return a message
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Export the middleware
module.exports = { authorize };
