// This line must be at the very top of the file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB with corrected options
mongoose.connect(MONGO_URI) // useNewUrlParser and useUnifiedTopology are no longer needed
    .then(() => console.log('Successfully connected to MongoDB!'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const profileRoutes = require('./routes/profile');
const profilesRoutes = require('./routes/profiles');
const jobsRoutes = require('./routes/jobs');
const recommendationsRoutes = require('./routes/recommendations');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/recommendations', recommendationsRoutes);

app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));