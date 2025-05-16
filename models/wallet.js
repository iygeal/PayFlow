// Import mongoose to define the Wallet schema
const mongoose = require('mongoose');

// Define wallet schema
const walletSchema = new mongoose.Schema(
  {
    // Reference to the user who owns this wallet
    user: {
      type: mongoose.Schema.Types.ObjectId, // Links to a User document
      ref: 'User'
    },
    // Wallet balance (defaults to 0 when a new wallet is created)
    balance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Export wallet model as Wallet
module.exports = mongoose.model('Wallet', walletSchema);
