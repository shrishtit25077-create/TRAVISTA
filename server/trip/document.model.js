const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  title: String,
  type: {
    type: String,
    enum: ['ticket', 'booking', 'pdf', 'image', 'other']
  }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
