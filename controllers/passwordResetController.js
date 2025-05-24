// Import necessary dependencies
const crypto = require('crypto');
const User = require('../models/user');
const sendEmail = require('../utils/sendEmail');

// Import environment variables
require('dotenv').config();
PORT = process.env.PORT || 3000;

// Implementation of forgot password feature
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Generate reset token and set expiry
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = Date.now() + 3600000; // expires in 1 hour

    // Store on user schema in DB
    user.resetToken = resetToken;
    user.resetTokenExpiry = tokenExpiry;
    await user.save();

    const resetLink = `http://localhost:${PORT}/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      'Reset Your Password',
      `Use this link to reset your password: ${resetLink}`,
      `<p>You requested a password reset.</p>
      <p>Click <a href="${resetLink}">here</a> to reset your password now.</p>
      <p>This link will expire in 1 hour.</p>`
    );

    res.status(200).json({ message: 'Check your email for password reset.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res
      .status(500)
      .json({ message: 'Server error during password reset request.' });
  }
};

module.exports = {
  forgotPassword,
};
