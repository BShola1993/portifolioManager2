const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const  ethers  = require('ethers'); // ✅ Added this import
const User = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');

const {
  loginController,
  registerController,
  updateUserController,
  deleteUserController,
  updateEmailController,
  updatePasswordController,
  updatePreferencesController,
} = require('../controllers/authenticationController');

// ✅ Classic routes
router.post('/login', loginController);
router.post('/register', registerController);

// ✅ Web3 wallet login (MetaMask)
router.post('/web3login', async (req, res) => {
  try {
    const { address, signature } = req.body;

    if (!address || !signature) {
      return res
        .status(400)
        .json({ success: false, message: 'Address and signature are required' });
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

    // ✅ Verify signature
    const message = 'Login to Lukman the defi'; // Must match frontend message
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res
        .status(401)
        .json({ success: false, message: 'Signature verification failed' });
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: user._id, address: user.walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      message: 'Web3 wallet login successful',
      user,
      token,
    });
  } catch (error) {
    console.error('❌ Web3 Login Error:', error);
    res
      .status(500)
      .json({ success: false, message: error.message || 'Internal Server Error' });
  }
});

// ✅ Authenticated routes
router.patch('/update', verifyToken, updateUserController);
router.patch('/updateEmail', verifyToken, updateEmailController);
router.patch('/updatePassword', verifyToken, updatePasswordController);
router.patch('/updatePreferences', verifyToken, updatePreferencesController);
router.delete('/delete', verifyToken, deleteUserController);

module.exports = router;
