const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  linkedinURL: { type: String, default: '' },
  skills: { type: [String], default: [] },
  walletAddress: { type: String, default: '' },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  connectionRequests: [{ from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }]
}, { timestamps: true });
module.exports = mongoose.model('User', UserSchema);