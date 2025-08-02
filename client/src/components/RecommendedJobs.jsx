import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const RecommendedJobs = () => {
    const [recommendations, setRecommendations] = useState([]);
    
    useEffect(() => {
        const fetchRecommendations = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const config = { headers: { 'x-auth-token': token } };
                    const res = await axios.get('http://localhost:5001/api/recommendations/jobs', config);
                    setRecommendations(res.data);
                } catch (err) {
                    console.error("Could not fetch recommendations", err);
                }
            }
        };
        fetchRecommendations();
    }, []);

    if (recommendations.length === 0) {
        return null; // Don't render the component if there are no recommendations
    }

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg">
            <h3 className="text-lg font-bold text-gray-900">Recommended For You</h3>
            <p className="text-xs text-gray-500">Based on your profile skills</p>
            <ul className="mt-4 space-y-4">
                {recommendations.map(job => (
                    <li key={job._id} className="border-t pt-3 first:border-t-0 first:pt-0">
                        <Link to="/jobs" className="font-semibold text-blue-600 hover:underline">{job.title}</Link>
                        <p className="text-sm text-gray-500">Budget: ${job.budget.toLocaleString()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default RecommendedJobs;
