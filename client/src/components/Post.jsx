import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Post = ({ postData, updatePostInFeed }) => {
    const [post, setPost] = useState(postData);
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);

    const handleClap = async () => { /* ... no changes ... */ };
    const handleCommentSubmit = async (e) => { /* ... no changes ... */ };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg">
            <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 text-blue-600 bg-blue-100 rounded-full font-bold">{post.user.name.charAt(0)}</div>
                <div>
                    <Link to={`/profile/${post.user._id}`} className="font-bold text-gray-800 hover:underline">{post.user.name}</Link>
                    <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
            </div>
            <p className="my-4 text-gray-700 whitespace-pre-wrap">{post.text}</p>
            {post.mediaUrl && (
                <div className="my-4 border rounded-lg overflow-hidden">
                    {post.mediaType === 'image' && <img src={post.mediaUrl} alt="Post content" className="w-full max-h-[600px] object-contain" />}
                    {post.mediaType === 'video' && <video src={post.mediaUrl} controls className="w-full max-h-[600px] bg-black" />}
                    {post.mediaType === 'pdf' && <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 text-blue-600 bg-gray-100 hover:bg-gray-200 transition-colors"><svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>View Document</a>}
                </div>
            )}
            <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{post.claps.length} Claps</span>
                <button onClick={() => setShowComments(!showComments)} className="hover:underline">{post.comments.length} Comments</button>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex space-x-6 text-gray-600">
                    <button onClick={handleClap} className="flex items-center space-x-2 hover:text-blue-600 transition-colors"><span className="text-xl">👏</span><span className="font-semibold">Clap</span></button>
                    <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-2 hover:text-blue-600 transition-colors"><span className="text-xl">💬</span><span className="font-semibold">Comment</span></button>
                </div>
            </div>
            {showComments && ( <div className="pt-4 mt-4 border-t border-gray-200">{/* ... comment section ... */}</div> )}
        </div>
    );
};
export default Post;