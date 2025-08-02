import React, { useState, useRef } from 'react';
import axios from 'axios';
import PostStatusMessage from './PostStatusMessage.jsx';

const CreatePost = ({ addPostToFeed }) => {
    const [text, setText] = useState('');
    const [mediaFiles, setMediaFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ message: '', type: '' });
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setMediaFiles(files);
        setPreviews(files.map(file => URL.createObjectURL(file)));
    };

    const removeMedia = (index) => {
        const newFiles = [...mediaFiles];
        newFiles.splice(index, 1);
        setMediaFiles(newFiles);

        const newPreviews = [...previews];
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
        
        if (fileInputRef.current) fileInputRef.current.value = null;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        setStatusMessage({ message: 'Uploading...', type: 'info' });
        const token = localStorage.getItem('token');
        let mediaUrls = [];
        let mediaTypes = [];

        try {
            if (mediaFiles.length > 0) {
                const mediaFormData = new FormData();
                mediaFiles.forEach(file => {
                    mediaFormData.append('media', file);
                });
                
                const uploadConfig = { headers: { 'x-auth-token': token } };
                const uploadRes = await axios.post('http://localhost:5001/api/posts/upload-media', mediaFormData, uploadConfig);
                mediaUrls = uploadRes.data.mediaUrls;
                mediaTypes = uploadRes.data.mediaTypes;
            }

            const postData = { text, mediaUrls, mediaTypes };
            const postConfig = { headers: { 'Content-Type': 'application/json', 'x-auth-token': token } };
            const res = await axios.post('http://localhost:5001/api/posts', postData, postConfig);

            addPostToFeed(res.data);
            setText('');
            setMediaFiles([]);
            setPreviews([]);
            setStatusMessage({ message: 'Post uploaded successfully!', type: 'success' });
        } catch (err) {
            const msg = err.response?.data?.msg || "Error creating post. Check file types and size.";
            setStatusMessage({ message: msg, type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    const renderPreview = (file, previewUrl) => {
        const fileType = file.type.split('/')[0];
        if (fileType === 'image') {
            return <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />;
        } else if (fileType === 'video') {
            return <video src={previewUrl} controls className="w-full h-full" />;
        } else if (fileType === 'audio') {
            return <audio src={previewUrl} controls className="w-full" />;
        } else {
            return (
                <div className="flex items-center justify-center p-4 text-gray-600 bg-gray-100 border rounded-lg h-full w-full">
                    <svg className="w-12 h-12 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
            );
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg">
            <form onSubmit={onSubmit}>
                <textarea className="w-full p-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Share an update, achievement, or ask a question..." value={text} onChange={(e) => setText(e.target.value)} required></textarea>
                {previews.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-4">
                        {previews.map((preview, index) => (
                            <div key={index} className="relative w-full rounded-lg max-h-96 object-contain bg-gray-100 border">
                                {renderPreview(mediaFiles[index], preview)}
                                <button onClick={() => removeMedia(index)} type="button" className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75">&times;</button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex items-center justify-between mt-4">
                    <div>
                        <button type="button" onClick={() => fileInputRef.current.click()} className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">Add Media</button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" multiple />
                    </div>
                    <button type="submit" disabled={isUploading} className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                        {isUploading ? 'Uploading...' : 'Post'}
                    </button>
                </div>
            </form>
            {statusMessage.message && <PostStatusMessage message={statusMessage.message} type={statusMessage.type} />}
        </div>
    );
};
export default CreatePost;