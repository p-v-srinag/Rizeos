const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    mediaUrls: { type: [String], default: [] }, // Updated to an array of strings
    mediaTypes: { type: [String], default: [] }, // Updated to an array of strings
    claps: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        name: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],
    shares: { type: Number, default: 0 },
    sharedBy: [{ type: mongoose.Types.ObjectId, ref: 'User' }] // To track unique sharers
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);