const PORT = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Wallet = require('../models/wallet');
const generateTokens = require('../utils/generateTokens');

// Dependencies for email verification and password reset
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
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


    // If email verification is enabled, generate token and attach to user
    if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
      const verificationToken = crypto.randomBytes(32).toString('hex');

      const verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

      newUser.emailVerificationToken = verificationToken;
      newUser.emailVerificationExpiry = verificationTokenExpiry;

      const verifyLink = `http://localhost:${PORT}/api/v1/auth/verify-email/${verificationToken}`;

      await sendEmail(
        email,
        'Verify your Email Address',
        `Click this link to verify your email: ${verifyLink}`,
        `<p>Hi ${firstName},</p>
        <p>Welcome to PayFlow! Please verify your email by clicking the link below:</p>
        <p><a href="${verifyLink}">Verify My Email<a/></p>
        <p>This link expires in 24 hours.</p>`
      );
    }

    // Save the user and update wallet reference
    await newUser.save();
    newWallet.user = newUser._id;
    await newWallet.save();

    // Generate JWT tokens for the session
    const { accessToken, refreshToken } = generateTokens(newUser._id);

    // Respond based on if email verification is required
    if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
      return res.status(201).json({
        message: 'User registered. Check your email to verify your account.',
      });
    } else {
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
    }
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

    // Block login if email is not verified (and it's required)
    if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true' && !user.isVerified) {
      return res.status(403).json({
        message:
          'Email not verified. Please check your inbox for a verification link; or request Iygeal Anozie to allow you a testing time.',
      });
    }

    // Compare entered password with the hashed one in DB
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

    const resetLink = `http://localhost:${PORT}/api/v1/auth/reset-password/${resetToken}`;

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
      `<p>Your password has been <strong>successfully</strong> reset. If you didn’t initiate this, please contact PayFlow support immediately.</p>`
    );

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Server error while resetting password.' });
  }
};

// Email verification logic using token from email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token!' });
    }

    // Mark user as verified and clear token fields by setting them to undefined
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    await user.save();

    res
      .status(200)
      .json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Email verification error:', error);
    res
      .status(500)
      .json({ message: 'Server error during email verification.' });
  }
};
// Export controller functions
module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
