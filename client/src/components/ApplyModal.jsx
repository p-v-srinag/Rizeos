import React, { useState } from 'react';

const ApplyModal = ({ job, onClose, onSubmit }) => {
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setResumeFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!resumeFile) {
            alert('Please upload a resume to apply.');
            return;
        }
        setLoading(true);
        await onSubmit(job._id, resumeFile);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl">&times;</button>
                <h3 className="text-2xl font-bold text-gray-900">Apply for {job.title}</h3>
                <p className="text-sm text-gray-600 mt-2">Posted by {job.user.name}</p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Upload your Resume (PDF)</label>
                        <input type="file" onChange={handleFileChange} accept=".pdf" required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-gray-400">
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default ApplyModal;