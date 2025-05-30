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

// Update profile of a logged in user
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    if (String(userId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized access.' });
    }
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).populate('wallet');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'User profile updated successfully.',
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        middleName: updatedUser.middleName,
        lastName: updatedUser.middleName,
        email: updatedUser.email,
        wallet: updatedUser.wallet,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(5000).json({ message: 'Server error updating profile.' });
  }
};

// Delete the logged-in user's account
const deleteUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    if (String(userId) !== String(req.params.id)) {
      return res.status(403).json({ message: 'Unauthorized access.' });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'User account deleted successfully.' });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ message: 'Server error deleting profile.' });
  }
};

// Export controller functions
module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
