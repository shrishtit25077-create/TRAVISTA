const express = require('express');
const { generateTrip, getUserTrips } = require('./trip.controller');
const router = express.Router();

const protect = (req, res, next) => {
  req.user = { authId: 'auth-user-123' };
  next();
};

router.post('/generate', protect, generateTrip);
router.get('/', protect, getUserTrips);

module.exports = router;
