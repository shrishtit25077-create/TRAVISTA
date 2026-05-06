const express = require('express');
const { loginOrRegister, updatePreferences, updateProfile } = require('./auth.controller');
const router = express.Router();

// Middleware placeholder for protecting routes
const protect = (req, res, next) => {
  // Mock protection
  req.user = { authId: 'auth-user-123' };
  next();
};

router.post('/login', loginOrRegister);
router.post('/preferences', protect, updatePreferences);
router.post('/profile', protect, updateProfile);

module.exports = router;
