const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  authId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  location: {
    type: String
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  preferences: {
    interests: [String],
    budget: {
      type: String,
      enum: ['Budget-Friendly (Backpacker)', 'Medium (Comfortable)', 'Luxury (Premium)']
    },
    travelStyle: String
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
