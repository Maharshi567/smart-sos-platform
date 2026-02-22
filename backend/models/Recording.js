const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  emergencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Emergency' },
  fileUrl: { type: String },
  type: { type: String, enum: ['audio', 'video'] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recording', recordingSchema);