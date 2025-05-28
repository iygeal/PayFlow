const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Wallet = require('../models/wallet');
const generateTokens = require('../utils/generateTokens');

// Password reset dependencies
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
require('dotenv').config();
PORT = process.env.PORT || 3000;

// Register a new user and auto-create wallet
const registerUser = async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ message: 'All required fields must be filled.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'User already exists with this email.' });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a wallet with default balance
    const newWallet = new Wallet({ balance: 0 });
    await newWallet.save();

    // Create the user and link to the wallet
    const newUser = new User({
      firstName,
      middleName,
      lastName,
      email,
      password: hashedPassword,
      wallet: newWallet._id,
    });
    await newUser.save();

    // Now update the wallet to reference the newly created user
    newWallet.user = newUser._id;
    await newWallet.save();

    // Generate JWT tokens for the session
    const { accessToken, refreshToken } = generateTokens(newUser._id);

    // Respond with success message and minimal user info
    res.status(201).json({
      message: 'User registered successfully.',
      accessToken,
      refreshToken,
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        wallet: {
          id: newWallet._id,
          balance: newWallet.balance,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Login an existing user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required.' });
    }

    // Find user by email; also populate wallet info
    const user = await User.findOne({ email }).populate('wallet');

    // If user doesn't exist
    if (!user) {
      return res
        .status(404)
        .json({ message: 'No account found with this email.' });
    }

    // Compare entered password with hashed one in DB
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Send success response
    res.status(200).json({
      message: 'Login successful.',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        walletBalance: user.wallet?.balance || 0,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res
      .status(500)
      .json({ message: 'Server error during login. Please try again.' });
  }
};


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

// The actual password reset logic
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    await sendEmail(
      user.email,
      'Password Reset Successful',
      'Your password has been changed successfully.',
      `<p>Your password has been <strong>successfully</strong> reset. If you didn’t initiate this, please contact support immediately.</p>`
    );

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Server error while resetting password.' });
  }
};
// Export controller functions
module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
