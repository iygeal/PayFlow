const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Wallet = require('../models/wallet');

// Register a new user and auto-create wallet
const registerUser = async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, password } = req.body;

    // Check required fields
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

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create wallet with 0 balance
    const newWallet = new Wallet({ balance: 0 });
    await newWallet.save();

    // Create user with reference to wallet
    const newUser = new User({
      firstName,
      middleName,
      lastName,
      email,
      password: hashedPassword,
      wallet: newWallet._id,
    });

    await newUser.save();

    // Generate JWT
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

module.exports = { registerUser };
