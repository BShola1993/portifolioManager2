const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { 
      type: String, 
      required: true,
      unique: true,
      trim: true
    },
    password: { 
      type: String 
    }, // ✅ not required for Web3 users
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true, // ✅ allow wallet users without email
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    walletAddress: {
      type: String,
      unique: true,
      sparse: true // ✅ only used for MetaMask / Web3 login
    },
    // ✅ Preferences from your old schema
    riskAversion: { type: Number, min: 1, max: 10 },
    volatilityTolerance: { type: Number, min: 1, max: 10 },
    growthFocus: { type: Number, min: 1, max: 10 },
    cryptoExperience: { type: Number, min: 1, max: 10 },
    innovationTrust: { type: Number, min: 1, max: 10 },
    impactInterest: { type: Number, min: 1, max: 10 },
    diversification: { type: Number, min: 1, max: 10 },
    holdingPatience: { type: Number, min: 1, max: 10 },
    monitoringFrequency: { type: Number, min: 1, max: 10 },
    adviceOpenness: { type: Number, min: 1, max: 10 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
