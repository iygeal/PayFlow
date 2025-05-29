const Wallet = require('../models/wallet');
const User = require('../models/user');
const Transaction = require('../models/transaction');

const transferMoney = async (req, res) => {
  try {
    const { receiverEmail, amount, description } = req.body;
    const senderId = req.user.id;

    if (!receiverEmail || !amount) {
      return res
        .status(400)
        .json({ message: 'Receiver email and amount are required.' });
    }

    if (amount <= 0) {
      return res
        .status(400)
        .json({ message: 'Amount must be greater than zero.' });
    }

    const sender = await User.findById(senderId).populate('wallet');
    const receiver = await User.findOne({ email: receiverEmail }).populate(
      'wallet'
    );

    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found.' });
    }

    if (String(sender._id) === String(receiver._id)) {
      return res.status(400).json({ message: 'Cannot transfer to yourself.' });
    }

    if (sender.wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance.' });
    }

    // Perform transfer
    sender.wallet.balance -= amount;
    receiver.wallet.balance += amount;

    await sender.wallet.save();
    await receiver.wallet.save();

    // Log transaction
    const transaction = new Transaction({
      sender: {id: sender._id,
        firstName: sender.firstName,
        lastName: sender.lastName,
        email: sender.email
      },
      receiver: {
        id: receiver._id,
        firstName: receiver.firstName,
        lastName: receiver.lastName,
        email: receiver.email
      },
      amount,
      description,
    });
    await transaction.save();

    res.status(200).json({
      message: 'Transfer successful.',
      transaction: {
        ...transaction._doc,
        type: 'debit', // Type is 'debit' for the sender
      }
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ message: 'Server error during transfer.' });
  }
};

const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'firstName lastName email')
      .populate('receiver', 'firstName lastName email')
      .sort({ createdAt: -1 });

    const formatted = transactions.map((txn) => ({
      id: txn._id,
      sender: txn.sender,
      receiver: txn.receiver,
      amount: txn.amount,
      description: txn.description,
      createdAt: txn.createdAt,
      type: txn.sender._id.toString() === userId ? 'debit' : 'credit',
    }));

    res.status(200).json({ transactions: formatted });
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res
      .status(500)
      .json({ message: 'Server error while fetching transactions.' });
  }
};

module.exports = {
  transferMoney,
  getUserTransactions,
};

