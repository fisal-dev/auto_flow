const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  notifications: { type: Boolean, default: true },
  subscriptionStatus: { type: String, enum: ['free', 'premium'], default: 'free' },
  stripeCustomerId: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'owner', 'manager', 'admin'], default: 'customer' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedGarages: [{ type: String, default: [] }],
  resetPasswordCode: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  rememberedDevices: [{
    deviceToken: { type: String, required: true },
    deviceName: { type: String, default: 'Web Browser' },
    lastUsed: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Pre-save hook to hash password
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
