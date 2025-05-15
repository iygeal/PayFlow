// Import mongoose to create the user schema
const mongoose = require('mongoose');

// Create user schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  }
},
{
  timestamps: true
});

// Export user model as User
module.exports = mongoose.model('User', userSchema);