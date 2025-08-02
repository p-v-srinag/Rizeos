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

// @route   POST api/posts/upload-media
// @desc    Upload a single media file to Cloudinary
// @access  Private
router.post('/upload-media', [auth, upload.single('media')], async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'No file uploaded.' });
  }
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataURI, { resource_type: "auto", folder: "rizeos_posts" });
    
    let mediaType;
    if (result.resource_type === 'video') mediaType = 'video';
    else if (req.file.mimetype === 'application/pdf') mediaType = 'pdf';
    else mediaType = 'image';

    res.json({ mediaUrl: result.secure_url, mediaType });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


// @route   POST api/posts
// @desc    Create a new post with optional media
// @access  Private
router.post('/', auth, async (req, res) => {
    const { text, mediaUrl, mediaType } = req.body;
    if (!text || text.trim() === '') {
        return res.status(400).json({ msg: 'Text is required' });
    }
    try {
        const newPost = new Post({ text, user: req.user.id, mediaUrl, mediaType });
        const post = await newPost.save();
        const populatedPost = await Post.findById(post._id).populate('user', 'name');
        res.json(populatedPost);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/posts
// @desc    Get all posts from feed
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().populate('user', 'name').sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) { res.status(500).send('Server Error'); }
});


// @route   PUT api/posts/clap/:id
// @desc    Clap/unclap a post
// @access  Private
router.put('/clap/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });
        
        // Check if the user has already clapped
        if (post.claps.some(clap => clap.user.toString() === req.user.id)) {
            post.claps = post.claps.filter(({ user }) => user.toString() !== req.user.id);
        } else {
            post.claps.unshift({ user: req.user.id });
        }
        await post.save();
        res.json(post.claps);
    } catch (err) { res.status(500).send('Server Error'); }
});


// @route   POST api/posts/comment/:id
// @desc    Comment on a post
// @access  Private
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


// @route   POST api/posts/share/:id
// @desc    Increment share count for a post
// @access  Public (or private, depending on your app logic)
router.post('/share/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        post.shares = (post.shares || 0) + 1;
        await post.save();
        res.json({ shares: post.shares });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;