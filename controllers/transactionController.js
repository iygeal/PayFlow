const Wallet = require('../models/wallet');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const sendEmail = require('../utils/sendEmail');
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
      sender: sender._id,
      receiver: receiver._id,
      amount,
      description,
    });
    await transaction.save();

    // Send debit alert to sender
    const senderEmailHTML = `
      <h2>Debit Alert - PayFlow</h2>
      <p>Hello ${sender.firstName},</p>
      <p>Your wallet has been debited <strong>₦${amount}</strong> for a transfer to <strong>${
      receiver.firstName
    } (${receiver.email})</strong>.</p>
      <p><strong>Description:</strong> ${
        description || 'No description provided'
      }</p>
      <p><strong>New Balance:</strong> ₦${sender.wallet.balance}</p>
    `;

    await sendEmail(
      sender.email,
      'Debit Alert - PayFlow',
      null,
      senderEmailHTML
    );

    // Send credit alert to receiver
    const receiverEmailHTML = `
     <h2>Credit Alert - PayFlow</h2>
     <p>Hello ${receiver.firstName},</p>
     <p>You have received <strong>₦${amount}</strong> from <strong>${
      sender.firstName
    } (${sender.email})</strong>.</p>
     <p><strong>Description:</strong> ${
       description || 'No description provided'
     }</p>
     <p><strong>New Balance:</strong> ₦${receiver.wallet.balance}</p>
   `;

    await sendEmail(
      receiver.email,
      'Credit Alert - PayFlow',
      null,
      receiverEmailHTML
    );
    res.status(200).json({
      message: 'Transfer successful.',
      transaction: {
        ...transaction._doc,
        type: 'debit', // Type is 'debit' for the sender
      },
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
