import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const RecommendedJobs = ({ userSkills }) => {
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!userSkills || userSkills.length === 0) {
                setLoading(false);
                return;
            }
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            try {
                // You can add a more sophisticated recommendation logic here.
                // For this MVP, we fetch jobs that share at least one skill.
                const res = await axios.get('http://localhost:5001/api/recommendations/jobs', config);
                setRecommendedJobs(res.data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchRecommendations();
    }, [userSkills]);

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