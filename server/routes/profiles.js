const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/profiles/:userId
// @desc    Get profile by user ID
router.get('/:userId', auth, async (req, res) => {
    try {
        const profile = await User.findById(req.params.userId).select('-password');
        if (!profile) return res.status(404).json({ msg: 'Profile not found' });
        res.json(profile);
    } catch (err) {
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Profile not found' });
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/profiles/interact/:userId
// @desc    Send an interact/connection request
router.put('/interact/:userId', auth, async (req, res) => {
    try {
        const recipient = await User.findById(req.params.userId);
        const sender = await User.findById(req.user.id);

        if (!recipient) return res.status(404).json({ msg: 'User not found' });
        if (recipient.id === sender.id) return res.status(400).json({ msg: 'You cannot connect with yourself.'});
        if (sender.connections.includes(recipient.id)) return res.status(400).json({ msg: 'You are already connected.'});
        if (recipient.connectionRequests.some(req => req.from.toString() === sender.id)) return res.status(400).json({ msg: 'Request already sent.' });
        
        recipient.connectionRequests.unshift({ from: req.user.id });
        await recipient.save();
        res.json(recipient.connectionRequests);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/profiles/accept/:senderId
// @desc    Accept a connection request
router.put('/accept/:senderId', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const sender = await User.findById(req.params.senderId);

        if (!sender) return res.status(404).json({ msg: 'Requesting user not found.' });

        currentUser.connectionRequests = currentUser.connectionRequests.filter(req => req.from.toString() !== sender.id);
        currentUser.connections.unshift(sender.id);
        sender.connections.unshift(currentUser.id);

        await currentUser.save();
        await sender.save();
        res.json({ msg: 'Connection accepted', connections: currentUser.connections });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
