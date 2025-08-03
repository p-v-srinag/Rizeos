const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const pdf = require('pdf-parse');
const keyword_extractor = require('keyword-extractor');
const User = require('../models/User');
const Job = require('../models/Job');
const mongoose = require('mongoose');

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

// @route   GET api/profile/jobs
// @desc    Get all jobs posted by the current user
// @access  Private
router.get('/jobs', auth, async (req, res) => {
    try {
        const jobs = await Job.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/profile/notifications
// @desc    Get all notifications for the current user
// @access  Private
router.get('/notifications', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('notifications');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        res.json(user.notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/profile/notifications/:notificationId
// @desc    Mark a notification as read or perform an action
// @access  Private
router.put('/notifications/:notificationId', auth, async (req, res) => {
    const { action } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        const notification = user.notifications.id(req.params.notificationId);
        if (!notification) return res.status(404).json({ msg: 'Notification not found' });

        if (action === 'accept') {
            const requester = await User.findById(notification.applicantId);
            if (requester) {
                user.connections.push(requester._id);
                requester.connections.push(user._id);
                await user.save();
                await requester.save();
            }
        }
        
        notification.read = true;
        await user.save();
        
        res.json({ msg: 'Notification updated' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;