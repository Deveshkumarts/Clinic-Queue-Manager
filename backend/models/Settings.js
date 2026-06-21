const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  baselineConsultationTime: { type: Number, default: 5 }, // in minutes
  doctorStatus: { type: String, enum: ['AVAILABLE', 'AWAY'], default: 'AVAILABLE' },
  statusMessage: { type: String, default: '' }
});

module.exports = mongoose.model('Settings', settingsSchema);
