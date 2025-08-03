const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const User = require('../models/User');

const calculateMatchScore = (userSkills, jobSkills) => {
    if (!userSkills || userSkills.length === 0 || !jobSkills || jobSkills.length === 0) return 0;
    
    const userSkillSet = new Set(userSkills.map(s => s.toLowerCase().trim()));
    const jobSkillSet = new Set(jobSkills.map(s => s.toLowerCase().trim()));

    const intersection = new Set([...userSkillSet].filter(skill => jobSkillSet.has(skill)));
    
    const matchPercentage = (intersection.size / jobSkillSet.size) * 100;

    return Math.round(matchPercentage);
};

router.get('/jobs', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.skills.length === 0) return res.json([]);
        
        const allJobs = await Job.find({ user: { $ne: req.user.id } }).populate('user', 'name').sort({ createdAt: -1 });

        const recommendedJobs = allJobs.filter(job => calculateMatchScore(user.skills, job.skills) >= 50);

        res.json(recommendedJobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;