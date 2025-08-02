const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const User = require('../models/User');

// @route   POST api/jobs
// @desc    Create a new job post
router.post('/', auth, async (req, res) => {
    const { title, description, skills, budget } = req.body;
    try {
        const newJob = new Job({
            title,
            description,
            skills: Array.isArray(skills) ? skills : skills.split(',').map(skill => skill.trim()),
            budget,
            user: req.user.id
        });
        const job = await newJob.save();
        const populatedJob = await Job.findById(job._id).populate('user', 'name');
        res.json(populatedJob);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/jobs
// @desc    Get all jobs, with optional skill filtering
// @access  Private (for logged-in users)
router.get('/', auth, async (req, res) => {
    try {
        const { skill } = req.query;
        let query = {};

        if (skill) {
            // Create a case-insensitive regex for the skill to find partial matches
            query.skills = { $regex: new RegExp(skill, 'i') };
        }

        const jobs = await Job.find(query).populate('user', 'name').sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;