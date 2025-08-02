const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');

// @route   POST api/jobs
// @desc    Create a new job post
// @access  Private
router.post('/', auth, async (req, res) => {
    const { title, description, skills, budget } = req.body;
    try {
        const newJob = new Job({
            title,
            description,
            skills,
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
// @access  Public (for now)
router.get('/', async (req, res) => {
    try {
        const { skill } = req.query;
        let query = {};
        if (skill) {
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