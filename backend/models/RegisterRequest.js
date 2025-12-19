const mongoose = require('mongoose');

const registerRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: Number, default: 2 }, // 0: Super Admin, 1: Admin, 2: Field User
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  lastLogin: { type: Date },
  phone: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
});

module.exports = mongoose.model('RegisterRequest', registerRequestSchema);
