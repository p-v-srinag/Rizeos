import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar.jsx';
import PostStatusMessage from './PostStatusMessage.jsx';
import { jwtDecode } from 'jwt-decode';

const JobApplications = () => {
    const { jobId } = useParams();
    const [applicants, setApplicants] = useState([]);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState({ message: '', type: '' });

    useEffect(() => {
        const fetchApplications = async () => {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            try {
                const res = await axios.get(`http://localhost:5001/api/jobs/applications/${jobId}`, config);
                setApplicants(res.data.applicants);
                setJob(res.data.job);
            } catch (err) {
                console.error(err);
                setStatusMessage({ message: err.response?.data?.msg || 'Error fetching applications.', type: 'error' });
            }
            setLoading(false);
        };
        fetchApplications();
    }, [jobId]);

    const handleUpdateStatus = async (applicantId, status) => {
        const token = localStorage.getItem('token');
        try {
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`http://localhost:5001/api/jobs/applications/${jobId}/status/${applicantId}`, { status }, config);
            
            const successMessage = status === 'Accepted'
                ? `Accepted application. We would like to move forward.`
                : `Declined application. Better luck next time.`;

            setStatusMessage({ message: successMessage, type: 'success' });
            
            setApplicants(applicants.map(app => 
                app.user && app.user._id === applicantId ? { ...app, status } : app
            ));
        } catch (err) {
            setStatusMessage({ message: err.response?.data?.msg || 'Error updating status.', type: 'error' });
        }
    };
    
    if (loading) return <div className="min-h-screen bg-[#F8F9FA]"><Navbar /><p className="text-center p-8">Loading applications...</p></div>;
    if (!job) return <div className="min-h-screen bg-[#F8F9FA]"><Navbar /><p className="text-center p-8">Job not found or you are not authorized to view this page.</p></div>;

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <Navbar />
            <main className="py-12">
                <div className="px-4 mx-auto max-w-4xl">
                    <h1 className="text-3xl font-bold text-gray-900">Applicants for {job.title}</h1>
                    <p className="mt-2 text-sm text-gray-600">Total Applicants: {applicants.length}</p>
                    <div className="mt-8 space-y-6">
                        {applicants.length > 0 ? applicants.map(applicant => (
                            <div key={applicant._id} className="p-6 bg-white rounded-xl shadow-lg flex items-center space-x-4">
                                <div className="flex items-center justify-center w-12 h-12 text-blue-600 bg-blue-100 rounded-full font-bold text-xl">{applicant.user && applicant.user.name ? applicant.user.name.charAt(0) : 'N/A'}</div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-bold text-gray-800">{applicant.user && applicant.user.name || 'N/A'}</h2>
                                    <p className="text-sm text-gray-500">{applicant.user && applicant.user.email || 'N/A'}</p>
                                    <div className="flex items-center space-x-4 mt-2">
                                        {applicant.user && (
                                            <Link to={`/profile/${applicant.user._id}`} className="text-blue-600 hover:underline text-sm">View Profile</Link>
                                        )}
                                        {applicant.resumeUrl && (
                                            <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-sm font-semibold">View Resume</a>
                                        )}
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    {applicant.status === 'Pending' && applicant.user && (
                                        <>
                                            <button onClick={() => handleUpdateStatus(applicant.user._id, 'Accepted')} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">Accept</button>
                                            <button onClick={() => handleUpdateStatus(applicant.user._id, 'Rejected')} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">Decline</button>
                                        </>
                                    )}
                                    {applicant.status !== 'Pending' && (
                                        <span className={`px-4 py-2 text-sm font-semibold text-white rounded-lg ${applicant.status === 'Accepted' ? 'bg-green-600' : 'bg-red-600'}`}>{applicant.status}</span>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <p className="p-12 text-center text-gray-500 bg-white rounded-lg shadow-md">No applicants yet.</p>
                        )}
                    </div>
                </div>
            </main>
            {statusMessage.message && <PostStatusMessage message={statusMessage.message} type={statusMessage.type} />}
        </div>
    );
};
export default JobApplications;