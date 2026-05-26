const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  vin: { type: String, required: true },
  registration: { type: String, required: true },
  status: { type: String, enum: ['success', 'warning', 'danger'], default: 'success' },
  mileage: { type: String, default: '0 km' },
  image: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);
