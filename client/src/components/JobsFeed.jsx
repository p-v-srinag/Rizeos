import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Navbar from './Navbar.jsx';
import { AuthContext } from '../context/AuthContext.jsx';

const JobsFeed = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchJobsAndProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            
            try {
                const config = { headers: { 'x-auth-token': token } };
                const [jobsRes, profileRes] = await Promise.all([
                    axios.get('http://localhost:5001/api/jobs', config),
                    axios.get('http://localhost:5001/api/profile/me', config)
                ]);
                
                setJobs(jobsRes.data);
                setUserProfile(profileRes.data);
            } catch (err) { 
                console.error(err); 
            }
            setLoading(false);
        };

        if (user) {
            fetchJobsAndProfile();
        }
    }, [user]);

    // AI Logic: Calculate Match Score
    const calculateMatchScore = (userSkills, jobSkills) => {
        if (!userSkills || userSkills.length === 0 || !jobSkills || jobSkills.length === 0) return 0;
        
        const userSkillSet = new Set(userSkills.map(s => s.toLowerCase().trim()));
        const jobSkillSet = new Set(jobSkills.map(s => s.toLowerCase().trim()));

        const intersection = new Set([...userSkillSet].filter(skill => jobSkillSet.has(skill)));
        
        const matchPercentage = (intersection.size / jobSkillSet.size) * 100;

        return Math.round(matchPercentage);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <Navbar />
            <main className="py-12">
                <div className="px-4 mx-auto max-w-4xl">
                    <div className="pb-8 border-b border-gray-200">
                        <h1 className="text-3xl font-bold text-gray-900">Open Opportunities</h1>
                        <p className="mt-1 text-sm text-gray-600">Browse jobs tailored to your skills.</p>
                    </div>
                    <div className="mt-8">
                        {loading ? (
                            <p className="text-center text-gray-500">Loading jobs...</p>
                        ) : jobs.length > 0 ? (
                            <ul className="space-y-6">
                                {jobs.map(job => {
                                    const matchScore = calculateMatchScore(userProfile?.skills, job.skills);
                                    
                                    return (
                                        <li key={job._id} className="relative p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                                            <div className="absolute top-0 right-0 p-4">
                                                <span className={`px-3 py-1 text-sm font-bold text-white rounded-full ${matchScore >= 75 ? 'bg-green-500' : matchScore >= 50 ? 'bg-yellow-500' : 'bg-gray-400'}`}>
                                                    {matchScore}% Match
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-xl font-bold text-blue-600 hover:underline cursor-pointer">{job.title}</h2>
                                                <span className="text-lg font-bold text-green-600">${job.budget.toLocaleString()}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">Posted by {job.user?.name || 'A Recruiter'}</p>
                                            <p className="mt-4 text-sm text-gray-700 line-clamp-3">{job.description}</p>
                                            <div className="mt-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {job.skills.map((skill, index) => (
                                                        <span key={index} className="px-3 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">{skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="p-12 text-center bg-white rounded-lg shadow-md">
                                <h3 className="text-lg font-medium text-gray-900">No Jobs Found</h3>
                                <p className="mt-1 text-sm text-gray-500">There are currently no open positions. Be the first to post one!</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};
export default JobsFeed;