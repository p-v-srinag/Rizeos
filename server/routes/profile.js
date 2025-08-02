const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const pdf = require('pdf-parse');
const keyword_extractor = require('keyword-extractor');
const User = require('../models/User');

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post('/', auth, async (req, res) => {
    const { name, bio, linkedinURL, skills, walletAddress } = req.body;
    const profileFields = { name, bio, linkedinURL, walletAddress, skills };
    try {
        const user = await User.findByIdAndUpdate(req.user.id, { $set: profileFields }, { new: true }).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/profile/parse-resume
// @desc    Upload a resume, parse it, and extract skills
// @access  Private
router.post('/parse-resume', [auth, upload.single('resume')], async (req, res) => {
    if (!req.file || req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ msg: 'Please upload a valid PDF file.' });
    }
    try {
        const data = await pdf(req.file.buffer);
        const keywords = keyword_extractor.extract(data.text, { language: "english", remove_digits: true, return_changed_case: true, remove_duplicates: true });
        const stopwords = ['i', 'me', 'my', 'and', 'the', 'a', 'to', 'of', 'for', 'in', 'with', 'experience', 'work', 'project', 'company', 'university', 'date', 'contact', 'email', 'phone', 'education', 'summary', 'professional', 'skill', 'skills', 'profile', 'objective', 'github', 'linkedin', 'developer', 'engineer', 'manager', 'lead', 'senior', 'junior', 'analyst', 'specialist', 'technologies', 'tools', 'languages', 'frameworks'];
        const filteredKeywords = keywords.filter(kw => !stopwords.includes(kw) && kw.length > 2 && isNaN(kw));
        res.json({ skills: filteredKeywords });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error: Could not parse PDF.');
    }
});

module.exports = router;