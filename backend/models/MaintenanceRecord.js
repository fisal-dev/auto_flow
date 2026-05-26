const mongoose = require('mongoose');

const MaintenanceRecordSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  date: { type: Date, required: true },
  service: { type: String, required: true },
  cost: { type: Number, default: 0 },
  provider: { type: String, required: true },
  status: { type: String, enum: ['success', 'info'], default: 'success' },
  label: { type: String, enum: ['Completed', 'Warranty'], default: 'Completed' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  stripeSessionId: { type: String, default: '' },
  attachment: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceRecord', MaintenanceRecordSchema);
