import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Navbar from './Navbar.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import PostStatusMessage from './PostStatusMessage.jsx';
import ApplyModal from './ApplyModal.jsx';
import { jwtDecode } from 'jwt-decode';

const JobsFeed = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [myApplications, setMyApplications] = useState([]);
    const [filter, setFilter] = useState('');
    const [statusMessage, setStatusMessage] = useState({ message: '', type: '' });
    const { user } = useContext(AuthContext);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        const fetchJobsAndProfile = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) { setLoading(false); return; }
            
            try {
                const config = { headers: { 'x-auth-token': token } };
                const jobsRes = await axios.get(`http://localhost:5001/api/jobs?skill=${filter}`, config);
                const profileRes = await axios.get('http://localhost:5001/api/profile/me', config);
                const applicationsRes = await axios.get('http://localhost:5001/api/jobs/my-applications', config);
                
                setJobs(jobsRes.data);
                setUserProfile(profileRes.data);
                setMyApplications(applicationsRes.data);
            } catch (err) { console.error(err); }
            setLoading(false);
        };

        if (user) {
            const handler = setTimeout(() => {
                fetchJobsAndProfile();
            }, 500); 

            return () => {
                clearTimeout(handler);
            };
        }
    }, [user, filter]); 

    // Corrected AI Logic: Calculate Match Score for case-insensitivity and punctuation
    const calculateMatchScore = (userSkills, jobSkills) => {
        if (!userSkills || userSkills.length === 0 || !jobSkills || jobSkills.length === 0) return 0;
        
        const userSkillSet = new Set(userSkills.map(s => s.toLowerCase().trim().replace('.', '')));
        const jobSkillSet = new Set(jobSkills.map(s => s.toLowerCase().trim().replace('.', '')));

        const intersection = new Set([...userSkillSet].filter(skill => jobSkillSet.has(skill)));
        
        const matchPercentage = (intersection.size / jobSkillSet.size) * 100;

        return Math.round(matchPercentage);
    };

    const handleApplyClick = (job) => {
        setSelectedJob(job);
        setShowApplyModal(true);
    };
    
    const handleApplicationSubmit = async (jobId, resumeFile) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('resume', resumeFile);

        try {
            const config = { headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' } };
            await axios.post(`http://localhost:5001/api/jobs/apply/${jobId}`, formData, config);
            setStatusMessage({ message: 'Application submitted successfully!', type: 'success' });
            setMyApplications(prev => [...prev, { job: { _id: jobId } }]);
        } catch (err) {
            setStatusMessage({ message: err.response?.data?.msg || 'Error submitting application.', type: 'error' });
        } finally {
            setShowApplyModal(false);
            setSelectedJob(null);
        }
    };
    
    const hasApplied = (jobId) => {
        return myApplications.some(app => app.job._id === jobId);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <Navbar />
            <main className="py-12">
                <div className="px-4 mx-auto max-w-4xl">
                    <div className="pb-8 border-b border-gray-200">
                        <h1 className="text-3xl font-bold text-gray-900">Open Opportunities</h1>
                        <p className="mt-1 text-sm text-gray-600">Browse and apply for jobs from top companies.</p>
                        <div className="mt-6">
                            <input 
                                type="text"
                                placeholder="Filter by skill (e.g., React, Node.js, Solidity...)"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="mt-8">
                        {loading ? <p className="p-12 text-center text-gray-500 bg-white rounded-lg shadow-md">Loading jobs...</p> : jobs.length > 0 ? (
                            <ul className="space-y-6">
                                {jobs.map(job => {
                                    const matchScore = calculateMatchScore(userProfile?.skills, job.skills);
                                    return (
                                        <li key={job._id} className="relative p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                                            <div className="flex justify-between items-center pb-4">
                                                <h2 className="text-xl font-bold text-blue-600 hover:underline cursor-pointer">{job.title}</h2>
                                                <span className={`px-3 py-1 text-sm font-bold text-white rounded-full ${matchScore >= 75 ? 'bg-green-500' : matchScore >= 50 ? 'bg-yellow-500' : 'bg-gray-400'}`}>
                                                    {matchScore}% Match
                                                </span>
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
                                            <div className="mt-6 flex justify-between items-center">
                                                <span className="text-lg font-bold text-green-600">₹{job.budget.toLocaleString()} LPA</span>
                                                {hasApplied(job._id) ? (
                                                    <span className="px-4 py-2 font-semibold text-white bg-green-600 rounded-lg shadow-sm">Applied</span>
                                                ) : (
                                                    <button onClick={() => handleApplyClick(job)} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">Apply for this Job</button>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : <p className="p-12 text-center text-gray-500 bg-white rounded-lg shadow-md">No jobs found for this filter.</p>}
                    </div>
                </div>
            </main>
            {showApplyModal && selectedJob && (
                <ApplyModal 
                    job={selectedJob} 
                    onClose={() => setShowApplyModal(false)}
                    onSubmit={handleApplicationSubmit}
                />
            )}
            {statusMessage.message && <PostStatusMessage message={statusMessage.message} type={statusMessage.type} />}
        </div>
    );
};
export default JobsFeed;