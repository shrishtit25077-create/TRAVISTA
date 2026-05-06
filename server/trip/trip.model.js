const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inputs: {
    destination: { type: String, required: true },
    dates: {
      start: Date,
      end: Date
    },
    budget: String,
    travelStyle: String
  },
  status: {
    type: String,
    enum: ['pending', 'generating', 'complete', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
