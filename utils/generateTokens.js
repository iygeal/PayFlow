// Import necessary dependencies
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  // Refreshtoken
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: '30d',
    }
  );
  return { accessToken, refreshToken };
};

module.exports = generateTokens;
