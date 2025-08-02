const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const pdf = require('pdf-parse');
const keyword_extractor = require('keyword-extractor');
const User = require('../models/User');

// ... (GET /me and POST / routes remain the same)
router.get('/me', auth, async (req, res) => { /* ... no changes ... */ });
router.post('/', auth, async (req, res) => { /* ... no changes ... */ });

// @route   POST api/profile/parse-resume
// @desc    Upload a resume, parse it, and extract skills
// @access  Private
router.post('/parse-resume', [auth, upload.single('resume')], async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded.' });
    }

    try {
        const data = await pdf(req.file.buffer);
        const text = data.text;

        const keywords = keyword_extractor.extract(text, {
            language: "english",
            remove_digits: true,
            return_changed_case: true,
            remove_duplicates: true
        });
        
        // You can use a more advanced stopwords list for better accuracy
        const stopwords = ['i', 'me', 'my', 'and', 'the', 'a', 'to', 'of', 'for', 'in', 'with', 'experience', 'work', 'project', 'company', 'university', 'date', 'contact', 'email', 'phone'];
        const filteredKeywords = keywords.filter(kw => !stopwords.includes(kw) && kw.length > 2);

        res.json({ skills: filteredKeywords });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error: Could not parse PDF.');
    }
});

module.exports = router;
