const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const User = require('../models/User');

// @route   GET api/recommendations/jobs
// @desc    Get job recommendations for the logged-in user
// @access  Private
router.get('/jobs', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.skills.length === 0) {
            return res.json([]);
        }
        
        // Find jobs that have at least one skill in common with the user's profile
        // Also exclude jobs posted by the current user
        const recommendedJobs = await Job.find({ skills: { $in: user.skills }, user: { $ne: req.user.id } })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(5); // Limit to 5 recommendations

        res.json(recommendedJobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;