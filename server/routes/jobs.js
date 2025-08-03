const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const User = require('../models/User');
const upload = require('../middleware/upload');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');

// @route   POST api/jobs
// @desc    Create a new job post
// @access  Private
router.post('/', auth, async (req, res) => {
    const { title, description, skills, budget } = req.body;
    try {
        const newJob = new Job({
            title,
            description,
            skills,
            budget,
            user: req.user.id
        });
        const job = await newJob.save();
        const populatedJob = await Job.findById(job._id).populate('user', 'name');
        res.json(populatedJob);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/jobs
// @desc    Get all jobs, with optional skill filtering
// @access  Public (for now)
router.get('/', async (req, res) => {
    try {
        const { skill } = req.query;
        let query = {};
        if (skill) {
            query.skills = { $regex: new RegExp(skill, 'i') };
        }
        const jobs = await Job.find(query).populate('user', 'name').sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/jobs/apply/:jobId
// @desc    Apply for a specific job with a resume
// @access  Private
router.post('/apply/:jobId', [auth, upload.single('resume')], async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }
        
        if (job.user && job.user.toString() === req.user.id) {
            return res.status(400).json({ msg: 'Cannot apply to your own job' });
        }
        
        if (job.applicants.some(applicant => applicant.user && applicant.user.toString() === req.user.id)) {
            return res.status(400).json({ msg: 'You have already applied for this job' });
        }
        
        let resumeUrl = '';
        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;
            const result = await cloudinary.uploader.upload(dataURI, { resource_type: "auto", folder: "rizeos_resumes" });
            resumeUrl = result.secure_url;
        }

        job.applicants.push({ user: req.user.id, status: 'Pending', resumeUrl });
        await job.save();
        
        const applicant = await User.findById(req.user.id);
        const recruiter = await User.findById(job.user);

        if (recruiter) {
            recruiter.notifications.unshift({
                message: `${applicant.name} applied for your job: ${job.title}`,
                type: 'job_application',
                jobId: job._id,
                applicantId: applicant._id
            });
            await recruiter.save();
        }
        
        res.json({ msg: 'Application submitted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /jobs/applications/:jobId/status/:applicantId
// @desc    Update the status of an application
// @access  Private (only for job poster)
router.put('/applications/:jobId/status/:applicantId', auth, async (req, res) => {
    const { status } = req.body;
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }
        
        if (job.user && job.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        
        const applicant = job.applicants.find(app => app.user && app.user.toString() === req.params.applicantId);
        if (!applicant) {
            return res.status(404).json({ msg: 'Applicant not found' });
        }
        
        applicant.status = status;
        await job.save();
        
        res.json({ msg: `Application status updated to ${status}` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/jobs/my-applications
// @desc    Get all jobs the current user has applied for
// @access  Private
router.get('/my-applications', auth, async (req, res) => {
    try {
        const applications = await Job.aggregate([
            { $unwind: "$applicants" },
            { $match: { "applicants.user": new mongoose.Types.ObjectId(req.user.id) } },
            { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "jobPoster" } },
            { $unwind: { path: "$jobPoster", preserveNullAndEmptyArrays: true } },
            { $project: {
                _id: "$applicants._id",
                appliedAt: "$applicants.appliedAt",
                status: "$applicants.status",
                job: {
                    _id: "$_id",
                    title: "$title",
                    user: {
                        name: "$jobPoster.name"
                    }
                }
            }}
        ]);
        res.json(applications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET api/jobs/applications/:jobId
// @desc    Get all applicants for a specific job
// @access  Private (only for job poster)
router.get('/applications/:jobId', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId).populate('applicants.user', 'name email resumeUrl');
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }
        
        if (job.user && job.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        
        res.json({ job, applicants: job.applicants });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;