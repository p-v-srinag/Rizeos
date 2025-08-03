const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    skills: {
        type: [String],
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    applicants: [{ 
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected'], default: 'Pending' },
        appliedAt: { type: Date, default: Date.now },
        resumeUrl: { type: String }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Job', JobSchema);