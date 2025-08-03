import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { jwtDecode } from 'jwt-decode';

const RecommendedJobs = () => {
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const [userProfile, setUserProfile] = useState(null);

    // Corrected AI Logic: Calculate Match Score for case-insensitivity and punctuation
    const calculateMatchScore = (userSkills, jobSkills) => {
        if (!userSkills || userSkills.length === 0 || !jobSkills || jobSkills.length === 0) return 0;
        
        const userSkillSet = new Set(userSkills.map(s => s.toLowerCase().trim().replace('.', '')));
        const jobSkillSet = new Set(jobSkills.map(s => s.toLowerCase().trim().replace('.', '')));

        const intersection = new Set([...userSkillSet].filter(skill => jobSkillSet.has(skill)));
        
        const matchPercentage = (intersection.size / jobSkillSet.size) * 100;

        return Math.round(matchPercentage);
    };

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            try {
                const [profileRes, jobsRes] = await Promise.all([
                    axios.get('http://localhost:5001/api/profile/me', config),
                    axios.get('http://localhost:5001/api/jobs', config)
                ]);

                const userSkills = profileRes.data.skills;
                const allJobs = jobsRes.data;

                const filteredJobs = allJobs.filter(job => calculateMatchScore(userSkills, job.skills) >= 50);
                setRecommendedJobs(filteredJobs);
                setUserProfile(profileRes.data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        if(user) fetchRecommendations();
    }, [user]);

    if (loading) return <p className="text-center text-gray-500">Loading recommendations...</p>;
    if (recommendedJobs.length === 0) return <p className="text-sm text-gray-500">No recommendations found. Update your profile with more skills.</p>;

    return (
        <ul className="space-y-4">
            {recommendedJobs.map(job => (
                <li key={job._id} className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                    <Link to="/jobs" className="text-md font-semibold text-blue-600 hover:underline">
                        {job.title}
                    </Link>
                    <p className="text-sm text-gray-500">Posted by {job.user.name}</p>
                </li>
            ))}
        </ul>
    );
};

export default RecommendedJobs;