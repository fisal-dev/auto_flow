const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['danger', 'warning', 'success'], default: 'danger' },
  label: { type: String, enum: ['Open', 'Investigating', 'Resolved'], default: 'Open' },
  response: { type: String, default: '' },
  assignedToStore: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCenter', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
