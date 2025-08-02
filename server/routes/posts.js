const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const Post = require('../models/Post');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post('/', auth, upload.single('media'), async (req, res) => {
    const { text } = req.body;
    if (!text || text.trim() === '') {
        return res.status(400).json({ msg: 'Text is required' });
    }
    try {
        let mediaUrl = '', mediaType = '';
        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;
            const result = await cloudinary.uploader.upload(dataURI, { resource_type: "auto", folder: "rizeos_posts" });
            mediaUrl = result.secure_url;
            if (result.resource_type === 'video') mediaType = 'video';
            else if (req.file.mimetype === 'application/pdf') mediaType = 'pdf';
            else mediaType = 'image';
        }
        const newPost = new Post({ text, user: req.user.id, mediaUrl, mediaType });
        const post = await newPost.save();
        const populatedPost = await Post.findById(post._id).populate('user', 'name');
        res.json(populatedPost);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().populate('user', 'name').sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/clap/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });
        if (post.claps.some(clap => clap.user.toString() === req.user.id)) {
            post.claps = post.claps.filter(({ user }) => user.toString() !== req.user.id);
        } else {
            post.claps.unshift({ user: req.user.id });
        }
        await post.save();
        res.json(post.claps);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/comment/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);
        const newComment = { text: req.body.text, name: user.name, user: req.user.id };
        post.comments.unshift(newComment);
        await post.save();
        const populatedPost = await Post.findById(req.params.id).populate('comments.user', 'name');
        res.json(populatedPost.comments);
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;


// ================================================================ //
// FILE: server/routes/profile.js (Update this file for resume parsing)
// ================================================================ //
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const pdf = require('pdf-parse');
const keyword_extractor = require('keyword-extractor');
const User = require('../models/User');

router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.post('/', auth, async (req, res) => {
    const { name, bio, linkedinURL, skills, walletAddress } = req.body;
    const profileFields = { name, bio, linkedinURL, walletAddress, skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()) };
    try {
        const user = await User.findByIdAndUpdate(req.user.id, { $set: profileFields }, { new: true }).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.post('/parse-resume', [auth, upload.single('resume')], async (req, res) => {
    if (!req.file || req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ msg: 'Please upload a valid PDF file.' });
    }
    try {
        const data = await pdf(req.file.buffer);
        const keywords = keyword_extractor.extract(data.text, { language: "english", remove_digits: true, return_changed_case: true, remove_duplicates: true });
        const stopwords = ['i', 'me', 'my', 'and', 'the', 'a', 'to', 'of', 'for', 'in', 'with', 'experience', 'work', 'project', 'company', 'university', 'date', 'contact', 'email', 'phone', 'education', 'summary', 'professional', 'skill', 'skills', 'profile', 'objective', 'github', 'linkedin'];
        const filteredKeywords = keywords.filter(kw => !stopwords.includes(kw) && kw.length > 2 && isNaN(kw));
        res.json({ skills: filteredKeywords });
    } catch (err) {
        res.status(500).send('Server Error: Could not parse PDF.');
    }
});

module.exports = router;
