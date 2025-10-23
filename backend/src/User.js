const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: false },
    password: { type: String },
    walletAddress: { type: String, unique: true, sparse: true }, // ✅ for Web3 login
    profilePic: { type: String, default: '' },
    preferences: {
      theme: { type: String, default: 'light' },
      language: { type: String, default: 'en' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
