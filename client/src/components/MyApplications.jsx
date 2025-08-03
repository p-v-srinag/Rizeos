import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar.jsx';
import PostStatusMessage from './PostStatusMessage.jsx';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState({ message: '', type: '' });

    useEffect(() => {
        const fetchMyApplications = async () => {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            try {
                const res = await axios.get('http://localhost:5001/api/jobs/my-applications', config);
                setApplications(res.data);
            } catch (err) {
                console.error(err);
                setStatusMessage({ message: err.response?.data?.msg || 'Error fetching applications.', type: 'error' });
            }
            setLoading(false);
        };
        fetchMyApplications();
    }, []);

    const getStatusWidth = (status) => {
        switch (status) {
            case 'Reviewed': return 'w-2/3';
            case 'Accepted': return 'w-full';
            case 'Rejected': return 'w-full';
            case 'Pending':
            default: return 'w-1/3';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Reviewed': return 'bg-yellow-500';
            case 'Accepted': return 'bg-green-500';
            case 'Rejected': return 'bg-red-500';
            case 'Pending':
            default: return 'bg-blue-500';
        }
    };
    
    if (loading) return <div className="min-h-screen bg-[#F8F9FA]"><Navbar /><p className="text-center p-8">Loading applications...</p></div>;

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <Navbar />
            <main className="py-12">
                <div className="px-4 mx-auto max-w-4xl">
                    <h1 className="text-3xl font-bold text-gray-900">My Job Applications</h1>
                    <p className="mt-2 text-sm text-gray-600">Track the status of the jobs you've applied for.</p>
                    <div className="mt-8 space-y-6">
                        {applications.length > 0 ? applications.map(app => (
                            <div key={app._id} className="p-6 bg-white rounded-xl shadow-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold text-blue-600">{app.job.title}</h2>
                                        <p className="text-sm text-gray-500">Posted by {app.job.user.name}</p>
                                    </div>
                                    <span className="px-3 py-1 text-sm font-semibold text-white bg-green-500 rounded-full">{app.status}</span>
                                </div>
                                <div className="mt-4">
                                    <h3 className="font-semibold">Your Application Details</h3>
                                    <p className="text-sm text-gray-700">Application submitted on: {new Date(app.appliedAt).toLocaleDateString()}</p>
                                    
                                    <div className="mt-6 relative">
                                        <div className="relative h-2 bg-gray-200 rounded-full">
                                            <div className={`h-2 rounded-full transition-all duration-500 ${getStatusColor(app.status)} ${getStatusWidth(app.status)}`}></div>
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs">
                                            <span className={`${app.status === 'Pending' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>Applied</span>
                                            <span className={`${app.status === 'Reviewed' ? 'text-yellow-500 font-semibold' : 'text-gray-500'}`}>Reviewed</span>
                                            <span className={`${app.status === 'Accepted' ? 'text-green-500 font-semibold' : app.status === 'Rejected' ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>{app.status === 'Rejected' ? 'Rejected' : 'Accepted'}</span>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        )) : (
                            <p className="p-12 text-center text-gray-500 bg-white rounded-lg shadow-md">You have not applied for any jobs yet.</p>
                        )}
                    </div>
                </div>
            </main>
            {statusMessage.message && <PostStatusMessage message={statusMessage.message} type={statusMessage.type} />}
        </div>
    );
};
export default MyApplications;