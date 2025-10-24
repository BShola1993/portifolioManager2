const authenticationService = require('../services/authentication/authentication');
const {
  badRequestJsonResponse,
  notFoundJsonResponse,
  unauthorizedJsonResponse,
  internalErrorJsonResponse,
  successJsonResponse,
} = require('../utils/jsonResponses/jsonResponses');

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // adjust if your model path is different
const { ethers } = require('ethers');

// ---------------------------
// Username/Password Controllers
// ---------------------------

const loginController = async (req, res) => {
  try {
    const token = await authenticationService.login(req.body.username, req.body.password);
    return res.json(successJsonResponse(token));
  } catch (error) {
    if (error.message === 'Invalid credentials') return res.json(unauthorizedJsonResponse(error.message));
    else return res.json(internalErrorJsonResponse(error.message));
  }
};

const registerController = async (req, res) => {
  try {
    const userData = {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      riskAversion: req.body.riskAversion,
      volatilityTolerance: req.body.volatilityTolerance,
      growthFocus: req.body.growthFocus,
      cryptoExperience: req.body.cryptoExperience,
      innovationTrust: req.body.innovationTrust,
      impactInterest: req.body.impactInterest,
      diversification: req.body.diversification,
      holdingPatience: req.body.holdingPatience,
      monitoringFrequency: req.body.monitoringFrequency,
      adviceOpenness: req.body.adviceOpenness
    };
    const user = await authenticationService.register(userData);
    return res.json(successJsonResponse(user));
  } catch (error) {
    if (error.message === 'User already exists') return res.json(badRequestJsonResponse(error.message));
    else return res.json(internalErrorJsonResponse(error.message));
  }
};

// ---------------------------
// Web3 Wallet Login Controller
// ---------------------------

const web3LoginController = async (req, res) => {
  try {
    const { address, signature } = req.body;
    if (!address || !signature) {
      return res.status(400).json({ error: "Address and signature are required" });
    }

    // Check if user exists, if not create a new one
    let user = await User.findOne({ address });
    if (!user) {
      user = await User.create({ address });
    }

    // Verify signature
    const message = "Login to Lukman the defi"; // same as frontend message
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: "Signature verification failed" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, address: user.address },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ token });
  } catch (err) {
    console.error("Web3 login error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ---------------------------
// Other existing controllers
// ---------------------------

const deleteUserController = async (req, res) => {
  try {
    const user = await authenticationService.deleteUser(req.body);
    return res.json(successJsonResponse(user));
  } catch (error) {
    if (error.message === 'User not found') return res.json(notFoundJsonResponse(error.message));
    else return res.json(internalErrorJsonResponse(error.message));
  }
};

const updateUserController = async (req, res) => {
  try {
    const user = await authenticationService.updateUser(req.body);
    return res.json(successJsonResponse(user));
  } catch (error) {
    if (error.message === 'User not found') return res.json(notFoundJsonResponse(error.message));
    else return res.json(internalErrorJsonResponse(error.message));
  }
};

const updateEmailController = async (req, res) => {
  try {
    const { username, newEmail } = req.body;
    if (!username || !newEmail) {
      return res.json(badRequestJsonResponse('Username and new email are required'));
    }
    const user = await authenticationService.updateEmail(username, newEmail);
    return res.json(successJsonResponse(user));
  } catch (error) {
    if (error.message === 'User not found') return res.json(notFoundJsonResponse(error.message));
    if (error.message === 'Email already exists') return res.json(badRequestJsonResponse(error.message));
    return res.json(internalErrorJsonResponse(error.message));
  }
};

const updatePasswordController = async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    if (!username || !newPassword) {
      return res.json(badRequestJsonResponse('Username and new password are required'));
    }
    const user = await authenticationService.updatePassword(username, newPassword);
    return res.json(successJsonResponse(user));
  } catch (error) {
    if (error.message === 'User not found') return res.json(notFoundJsonResponse(error.message));
    return res.json(internalErrorJsonResponse(error.message));
  }
};

const updatePreferencesController = async (req, res) => {
  try {
    const { username, ...preferences } = req.body;
    if (!username) {
      return res.json(badRequestJsonResponse('Username is required'));
    }
    const user = await authenticationService.updatePreferences(username, preferences);
    return res.json(successJsonResponse(user));
  } catch (error) {
    if (error.message === 'User not found') return res.json(notFoundJsonResponse(error.message));
    if (error.message.includes('must be a number between 1 and 10')) return res.json(badRequestJsonResponse(error.message));
    return res.json(internalErrorJsonResponse(error.message));
  }
};

// ---------------------------
// Export all controllers
// ---------------------------

module.exports = {
  loginController,
  registerController,
  updateUserController,
  deleteUserController,
  updateEmailController,
  updatePasswordController,
  updatePreferencesController,
  web3LoginController
};
