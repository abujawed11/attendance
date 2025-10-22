const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Signup flow
router.post('/signup', authController.signup);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);

// Login
router.post('/login', authController.login);

module.exports = router;
