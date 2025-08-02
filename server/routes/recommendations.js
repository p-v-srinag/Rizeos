const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const User = require('../models/User');

router.get('/jobs', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.skills.length === 0) return res.json([]);
        const recommendedJobs = await Job.find({ skills: { $in: user.skills }, user: { $ne: req.user.id } }).populate('user', 'name').sort({ createdAt: -1 }).limit(5);
        res.json(recommendedJobs);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
