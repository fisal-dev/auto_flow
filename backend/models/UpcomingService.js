const mongoose = require('mongoose');

const UpcomingServiceSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  urgency: { type: String, enum: ['warning', 'neutral', 'info'], default: 'neutral' },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  provider: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('UpcomingService', UpcomingServiceSchema);
