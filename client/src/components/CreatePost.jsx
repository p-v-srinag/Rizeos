import React, { useState, useRef } from 'react';
import axios from 'axios';

const CreatePost = ({ addPostToFeed }) => {
    const [text, setText] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMediaFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeMedia = () => {
        setMediaFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = null;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        const token = localStorage.getItem('token');
        let mediaUrl = '', mediaType = '';

        try {
            // Step 1: Upload media to Cloudinary if a file is selected
            if (mediaFile) {
                const mediaFormData = new FormData();
                mediaFormData.append('media', mediaFile);
                const uploadConfig = { headers: { 'x-auth-token': token } };
                const uploadRes = await axios.post('http://localhost:5001/api/posts/upload-media', mediaFormData, uploadConfig);
                mediaUrl = uploadRes.data.mediaUrl;
                mediaType = uploadRes.data.mediaType;
            }

            // Step 2: Create the post with the text and media URL
            const postData = { text, mediaUrl, mediaType };
            const postConfig = { headers: { 'Content-Type': 'application/json', 'x-auth-token': token } };
            const res = await axios.post('http://localhost:5001/api/posts', postData, postConfig);

            addPostToFeed(res.data);
            setText('');
            removeMedia();
        } catch (err) {
            alert(err.response?.data?.msg || "Error creating post. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg">
            <form onSubmit={onSubmit}>
                <textarea className="w-full p-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Share an update, achievement, or ask a question..." value={text} onChange={(e) => setText(e.target.value)} required></textarea>
                {preview && (
                    <div className="relative mt-4">
                        {mediaFile.type.startsWith('image/') && <img src={preview} alt="Preview" className="w-full rounded-lg max-h-96 object-contain bg-gray-100" />}
                        {mediaFile.type.startsWith('video/') && <video src={preview} controls className="w-full rounded-lg max-h-96" />}
                        {mediaFile.type === 'application/pdf' && <div className="flex items-center p-4 text-gray-600 bg-gray-100 border rounded-lg"><svg className="w-6 h-6 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>{mediaFile.name}</div>}
                        <button onClick={removeMedia} type="button" className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75">&times;</button>
                    </div>
                )}
                <div className="flex items-center justify-between mt-4">
                    <div>
                        <button type="button" onClick={() => fileInputRef.current.click()} className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">Add Media</button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*,.pdf" />
                    </div>
                    <button type="submit" disabled={isUploading} className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                        {isUploading ? 'Uploading...' : 'Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};
export default CreatePost;