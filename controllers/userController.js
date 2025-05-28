const User = require('../models/user');

// Get the profile of the logged-in user
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Ensure the user is the logged in user
    if (String(userId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized access.' });
    }

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

module.exports = {
  getUserProfile,
};