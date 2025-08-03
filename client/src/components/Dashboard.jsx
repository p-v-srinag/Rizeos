import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import axios from 'axios';
import Navbar from './Navbar.jsx';
import RecommendedJobs from './RecommendedJobs.jsx';
import PostStatusMessage from './PostStatusMessage.jsx';
import keyword_extractor from 'keyword-extractor';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({ name: '', bio: '', linkedinURL: '', skills: '' });
    const [postedJobs, setPostedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ message: '', type: '' });
    const resumeInputRef = useRef(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchProfileData = async () => {
            const token = localStorage.getItem('token');
            if (!token) { setLoading(false); return; }

            try {
                const config = { headers: { 'x-auth-token': token } };
                const [profileRes, jobsRes] = await Promise.all([
                    axios.get('http://localhost:5001/api/profile/me', config),
                    axios.get('http://localhost:5001/api/profile/jobs', config)
                ]);
                setProfile(profileRes.data);
                setPostedJobs(jobsRes.data);
                setFormData({
                    name: profileRes.data.name || '',
                    bio: profileRes.data.bio || '',
                    linkedinURL: profileRes.data.linkedinURL || '',
                    skills: profileRes.data.skills.join(', ') || ''
                });
            } catch (err) { console.error(err.message); }
            setLoading(false);
        };
        fetchProfileData();
    }, [user]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const config = { headers: { 'Content-Type': 'application/json', 'x-auth-token': token } };
            const body = { 
                name: formData.name,
                bio: formData.bio,
                linkedinURL: formData.linkedinURL,
                skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
            };
            const res = await axios.post('http://localhost:5001/api/profile', body, config);
            setProfile(res.data);
            setIsEditing(false);
            setStatusMessage({ message: 'Profile Updated Successfully!', type: 'success' });
        } catch (err) {
            console.error(err.message);
            setStatusMessage({ message: 'Error updating profile.', type: 'error' });
        }
    };

    const handleSkillExtraction = () => {
        if (!formData.bio) {
            alert("Please write something in your bio first.");
            return;
        }
        const keywords = keyword_extractor.extract(formData.bio, { language: "english", remove_digits: true, return_changed_case: true, remove_duplicates: true });
        const stopwords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'from', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now', 'developer', 'experience', 'skilled', 'worked'];
        const filteredKeywords = keywords.filter(kw => !stopwords.includes(kw) && kw.length > 1);
        setFormData({ ...formData, skills: filteredKeywords.join(', ') });
    };

    const cancelEdit = () => {
        setFormData({
            name: profile.name || '',
            bio: profile.bio || '',
            linkedinURL: profile.linkedinURL || '',
            skills: profile.skills.join(', ') || ''
        });
        setIsEditing(false);
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const token = localStorage.getItem('token');
        const resumeFormData = new FormData();
        resumeFormData.append('resume', file);

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token } };
            const res = await axios.post('http://localhost:5001/api/profile/parse-resume', resumeFormData, config);
            
            const existingSkills = new Set(formData.skills.split(',').map(s => s.trim()).filter(Boolean));
            res.data.skills.forEach(skill => existingSkills.add(skill));

            setFormData({ ...formData, skills: Array.from(existingSkills).join(', ') });
            setStatusMessage({ message: "Skills extracted from resume and added!", type: 'success' });
        } catch (err) {
            console.error(err);
            setStatusMessage({ message: "Error parsing resume. Please ensure it's a valid PDF.", type: 'error' });
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-[#F8F9FA]">Loading Profile...</div>;
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <Navbar />
            <main className="py-12">
                <div className="px-4 mx-auto max-w-4xl">
                    <div className="p-8 bg-white rounded-xl shadow-lg">
                        {isEditing ? (
                            <form onSubmit={onSubmit} className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900">Edit Your Profile</h2>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={onChange} className="block w-full px-4 py-3 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                </div>
                                <div>
                                    <label htmlFor="linkedinURL" className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                                    <input type="text" name="linkedinURL" value={formData.linkedinURL} onChange={onChange} className="block w-full px-4 py-3 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                </div>
                                <div>
                                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                                    <textarea name="bio" value={formData.bio} onChange={onChange} rows="5" placeholder="Describe your experience..." className="block w-full px-4 py-3 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="skills" className="text-sm font-medium text-gray-700">Skills (comma separated)</label>
                                        <button type="button" onClick={handleSkillExtraction} className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors">Auto-Extract Skills</button>
                                    </div>
                                    <input type="text" name="skills" value={formData.skills} onChange={onChange} className="block w-full px-4 py-3 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                </div>
                                <div className="flex justify-between pt-4 border-t">
                                    <input type="file" ref={resumeInputRef} onChange={handleResumeUpload} className="hidden" accept=".pdf" />
                                    <button type="button" onClick={() => resumeInputRef.current.click()} className="px-6 py-2 font-semibold text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                                        Upload & Parse Resume (PDF)
                                    </button>
                                    <div className="flex space-x-4">
                                        <button type="button" onClick={cancelEdit} className="px-6 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                                        <button type="submit" className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">Save Changes</button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between pb-6 border-b">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">{profile?.name}</h1>
                                        <p className="mt-1 text-sm text-gray-500">{profile?.email}</p>
                                        {profile?.linkedinURL && <a href={profile.linkedinURL.startsWith('http') ? profile.linkedinURL : `https://${profile.linkedinURL}`} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 text-sm text-blue-500 hover:underline">{profile.linkedinURL}</a>}
                                    </div>
                                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 font-semibold text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">Edit Profile</button>
                                </div>
                                <dl className="mt-6 space-y-6">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">About</dt>
                                        <dd className="mt-1 text-base text-gray-900 whitespace-pre-wrap">{profile?.bio || 'No bio provided.'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Skills</dt>
                                        <dd className="mt-2">
                                            <div className="flex flex-wrap gap-2">
                                                {profile?.skills && profile.skills.length > 0 ? profile.skills.map((skill, index) => (
                                                    <span key={index} className="px-3 py-1 text-sm font-semibold text-gray-800 bg-gray-100 rounded-full">{skill}</span>
                                                )) : <span className="text-sm text-gray-500">No skills listed.</span>}
                                            </div>
                                        </dd>
                                    </div>
                                </dl>
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-900">Recommended Jobs</h3>
                                    {profile?.skills && profile.skills.length > 0 ? (
                                        <RecommendedJobs userSkills={profile.skills} />
                                    ) : (
                                        <p className="text-sm text-gray-500">Please add skills to your profile to see job recommendations.</p>
                                    )}
                                </div>
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-900">Jobs I've Posted</h3>
                                    <div className="mt-4 space-y-4">
                                        {postedJobs.length > 0 ? postedJobs.map(job => (
                                            <div key={job._id} className="p-4 bg-gray-50 rounded-lg shadow-sm flex items-center justify-between">
                                                <h4 className="font-semibold text-gray-800">{job.title}</h4>
                                                <Link to={`/jobs/applications/${job._id}`} className="text-sm text-blue-600 hover:underline">View Applicants ({job.applicants.length})</Link>
                                            </div>
                                        )) : <p className="text-sm text-gray-500">You have not posted any jobs yet.</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            {statusMessage.message && <PostStatusMessage message={statusMessage.message} type={statusMessage.type} />}
        </div>
    );
};
export default Dashboard;