const express = require('express');
const router = express.Router();

const {
  loginController,
  registerController,
  updateUserController,
  deleteUserController,
  updateEmailController,
  updatePasswordController,
  updatePreferencesController,
} = require('../controllers/authenticationController');

const verifyToken = require('../middlewares/verifyToken');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ Classic routes
router.post('/login', loginController);
router.post('/register', registerController);

// ✅ Web3 wallet login (MetaMask)
router.post('/web3login', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ success: false, message: 'Wallet address is required' });
    }

    // ✅ Find or create user
    let user = await User.findOne({ walletAddress: address });
    if (!user) {
      user = await User.create({
        username: `wallet_${address.slice(2, 8)}`,
        walletAddress: address,
        email: `${address.slice(2, 8)}@walletuser.io`,
      });
    }

    // ✅ Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      success: true,
      message: 'Web3 wallet login successful',
      user,
      token,
    });
  } catch (error) {
    console.error('❌ Web3 Login Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Authenticated routes
router.patch('/update', verifyToken, updateUserController);
router.patch('/updateEmail', verifyToken, updateEmailController);
router.patch('/updatePassword', verifyToken, updatePasswordController);
router.patch('/updatePreferences', verifyToken, updatePreferencesController);
router.delete('/delete', verifyToken, deleteUserController);

module.exports = router;
