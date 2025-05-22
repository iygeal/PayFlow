const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Wallet = require('../models/wallet');
const generateTokens = require('../utils/generateTokens');

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

// Get the profile of the logged-in user
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find user by id and populate wallet details
    const user = await User.findById(userId).populate('wallet');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      email: user.email,
      wallet: user.wallet
        ? {
            id: user.wallet._id,
            balance: user.wallet.balance,
          }
        : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
};

// Export user controller functions
module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
