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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Job', JobSchema);


// ---------------------------------------------------------------- //
// FILE: server/routes/jobs.js (Create this new file)
// ---------------------------------------------------------------- //
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const User = require('../models/User');

// @route   POST api/jobs
// @desc    Create a new job post
// @access  Private
router.post('/', auth, async (req, res) => {
    const { title, description, skills, budget } = req.body;

    try {
        const user = await User.findById(req.user.id).select('-password');

        const newJob = new Job({
            title,
            description,
            skills: Array.isArray(skills) ? skills : skills.split(',').map(skill => skill.trim()),
            budget,
            user: req.user.id
        });

        const job = await newJob.save();
        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/jobs
// @desc    Get all jobs
// @access  Public
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 }); // Sort by most recent
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;