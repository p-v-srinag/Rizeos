const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const jobRoutes = require('./routes/jobs');
const postRoutes = require('./routes/posts');
const profilesApiRoutes = require('./routes/profiles'); // Renamed for clarity

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes); // For the logged-in user's own profile
app.use('/api/profiles', profilesApiRoutes); // For viewing other profiles and interactions
app.use('/api/jobs', jobRoutes);
app.use('/api/posts', postRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Rizeos Server!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
