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
  connectionRequests: [{ from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
  notifications: [{
      message: { type: String, required: true },
      type: { type: String, enum: ['job_application', 'connection_request'], required: true },
      jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
      applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
      read: { type: Boolean, default: false }
  }]
}, { timestamps: true });
module.exports = mongoose.model('User', UserSchema);