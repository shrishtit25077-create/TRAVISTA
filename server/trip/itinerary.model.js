const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  structuredPlan: {
    // 1 BEST option and 2 ALTERNATIVES
    bestOption: {
      flights: [Object],
      stays: [Object],
      activities: [Object],
      score: Number,
      totalBudget: Number
    },
    alternatives: [{
      flights: [Object],
      stays: [Object],
      activities: [Object],
      score: Number,
      totalBudget: Number
    }]
  }
}, { timestamps: true });

module.exports = mongoose.model('Itinerary', itinerarySchema);
