// server/routes/profile.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // req.user.id is available from the auth middleware
    const user = await User.findById(req.user.id).select('-password'); // Exclude password from the result
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, bio, linkedinURL, skills, walletAddress } = req.body;

  const profileFields = {};
  if (name) profileFields.name = name;
  if (bio) profileFields.bio = bio;
  if (linkedinURL) profileFields.linkedinURL = linkedinURL;
  if (walletAddress) profileFields.walletAddress = walletAddress;
  if (skills) {
    // Ensure skills is an array of strings
    profileFields.skills = Array.isArray(skills) ? skills : skills.split(',').map(skill => skill.trim());
  }

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Using findByIdAndUpdate is efficient for updates
    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true } // Return the updated document
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
