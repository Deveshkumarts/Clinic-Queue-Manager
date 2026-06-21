const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  tokenNumber: { type: Number, required: true, unique: true },
  status: { type: String, enum: ['WAITING', 'ACTIVE', 'COMPLETED'], default: 'WAITING' },
  isEmergency: { type: Boolean, default: false },
  addedAt: { type: Date, default: Date.now },
  calledAt: { type: Date },
  completedAt: { type: Date }
});

module.exports = mongoose.model('Token', tokenSchema);
