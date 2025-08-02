import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar.jsx';
import { AuthContext } from '../context/AuthContext.jsx';

const ProfilePage = () => {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUserProfile, setCurrentUserProfile] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        const fetchProfiles = async () => {
            try {
                const [profileRes, currentUserRes] = await Promise.all([
                    axios.get(`http://localhost:5001/api/profiles/${userId}`, config),
                    axios.get(`http://localhost:5001/api/profile/me`, config)
                ]);
                setProfile(profileRes.data);
                setCurrentUserProfile(currentUserRes.data);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchProfiles();
    }, [userId]);

    const handleInteract = async () => {
        const token = localStorage.getItem('token');
        try {
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`http://localhost:5001/api/profiles/interact/${userId}`, {}, config);
            alert('Interact request sent!');
            // You might want to update the UI state to reflect "Request Sent" immediately
        } catch (err) {
            alert(err.response.data.msg || 'Error sending request.');
        }
    };
    
    if (loading) return <div className="min-h-screen bg-[#F8F9FA]"><Navbar /><p className="text-center p-8">Loading profile...</p></div>;
    if (!profile) return <div className="min-h-screen bg-[#F8F9FA]"><Navbar /><p className="text-center p-8">Profile not found.</p></div>;

    const isConnected = currentUserProfile?.connections.includes(profile._id);
    const requestSent = profile.connectionRequests.some(req => req.from === currentUserProfile?._id);
    const isSelf = currentUserProfile?._id === profile._id;

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <Navbar />
            <main className="py-12">
                <div className="px-4 mx-auto max-w-4xl">
                    <div className="p-8 bg-white rounded-xl shadow-lg">
                        <div className="flex items-center justify-between pb-6 border-b">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                                <p className="mt-1 text-sm text-gray-500">{profile.email}</p>
                                {profile.linkedinURL && <a href={profile.linkedinURL} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 text-sm text-blue-500 hover:underline">{profile.linkedinURL}</a>}
                            </div>
                            {!isSelf && (
                                <button onClick={handleInteract} disabled={isConnected || requestSent} className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {isConnected ? 'Connected' : requestSent ? 'Request Sent' : 'Interact'}
                                </button>
                            )}
                        </div>
                        <dl className="mt-6 space-y-6">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">About</dt>
                                <dd className="mt-1 text-base text-gray-900 whitespace-pre-wrap">{profile.bio || 'No bio provided.'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Skills</dt>
                                <dd className="mt-2">
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills && profile.skills.length > 0 ? profile.skills.map((skill, index) => (
                                            <span key={index} className="px-3 py-1 text-sm font-semibold text-gray-800 bg-gray-100 rounded-full">{skill}</span>
                                        )) : <span className="text-sm text-gray-500">No skills listed.</span>}
                                    </div>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </main>
        </div>
    );
};
export default ProfilePage;