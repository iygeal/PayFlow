const Wallet = require('../models/wallet');
const sendAlertEmail = require('../utils/sendAlertEmail');
const User = require('../models/user');

const fundWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ message: 'Amount must be greater than 0.' });
    }

    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found.' });
    }

    wallet.balance += amount;
    await wallet.save();

    // Get user details for email alert
    const user = await User.findById(userId);

    // Compose alert email
    const emailHTML = `
      <h2>Hi ${user.firstName},</h2>
      <p>Your wallet has just been funded with <strong>₦${amount}</strong>.</p>
      <p>New Balance: <strong>₦${wallet.balance}</strong></p>
      <p>Time: ${new Date().toLocaleString()}</p>
      <p>If this wasn't you, please contact PayFlow support immediately.</p>
      <br>
      <p>Thanks,<br>PayFlow Team</p>
    `;

    
    res.status(200).json({
      message: 'Wallet funded successfully.',
      newBalance: wallet.balance,
    });
  } catch (error) {
    console.error('Wallet funding error:', error);
    res.status(500).json({ message: 'Server error during wallet funding.' });
  }
};

// Get current wallet balance with timestamp
const getWalletBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found.' });
    }

    // Format the time to show local time
    const readableTime = new Date().toLocaleString('en-US', {
      timeZone: 'Africa/Lagos',
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    res.status(200).json({
      walletId: wallet._id,
      balance: wallet.balance,

      // Show the user the exact time the balance was fetched
      asAt: readableTime,
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res
      .status(500)
      .json({ message: 'Server error while fetching wallet balance.' });
  }
};

module.exports = {
  fundWallet,
  getWalletBalance,
};
