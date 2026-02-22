const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
  recordingUrl: { type: String },
  alertsSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Emergency', emergencySchema);