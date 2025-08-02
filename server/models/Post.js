const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PostSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    mediaUrl: { type: String },
    mediaType: { type: String }, // 'image', 'video', or 'pdf'
    claps: [{ user: { type: Schema.Types.ObjectId, ref: 'User' } }],
    comments: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        name: { type: String },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });
module.exports = mongoose.model('Post', PostSchema);