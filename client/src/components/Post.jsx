import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Post = ({ postData, updatePostInFeed }) => {
    const [post, setPost] = useState(postData);
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleClap = async () => {
        const token = localStorage.getItem('token');
        try {
            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.put(`http://localhost:5001/api/posts/clap/${post._id}`, {}, config);
            const updatedClaps = res.data;
            const updatedPost = { ...post, claps: updatedClaps };
            setPost(updatedPost);
            updatePostInFeed(updatedPost);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (commentText.trim() === '') {
            return alert('Comment cannot be empty');
        }
        try {
            const config = { headers: { 'Content-Type': 'application/json', 'x-auth-token': token } };
            const res = await axios.post(`http://localhost:5001/api/posts/comment/${post._id}`, { text: commentText }, config);
            const updatedComments = res.data;
            const updatedPost = { ...post, comments: updatedComments };
            setPost(updatedPost);
            updatePostInFeed(updatedPost);
            setCommentText('');
        } catch (err) {
            console.error(err);
        }
    };
    
    const handleShare = async () => {
        const token = localStorage.getItem('token');
        try {
            const config = { headers: { 'x-auth-token': token } };
            await axios.post(`http://localhost:5001/api/posts/share/${post._id}`, {}, config);
            const updatedPost = { ...post, shares: (post.shares || 0) + 1 };
            setPost(updatedPost);
            updatePostInFeed(updatedPost);
            setShowSharePopup(true);
        } catch (err) {
            alert(err.response?.data?.msg || 'Error sharing post.');
        }
    };

    const copyToClipboard = async () => {
        const url = `${window.location.origin}/post/${post._id}`;
        try {
            await navigator.clipboard.writeText(url);
            setIsCopied(true);
        } catch (err) {
            console.error('Failed to copy: ', err);
        } finally {
            setTimeout(() => {
                setShowSharePopup(false);
                setIsCopied(false);
            }, 1000);
        }
    };

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
                <div className="flex items-center space-x-4">
                    <span>{post.claps.length} Claps</span>
                    <button onClick={() => setShowComments(!showComments)} className="hover:underline">{post.comments.length} Comments</button>
                    <span>{post.shares || 0} Shares</span>
                </div>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex space-x-6 text-gray-600">
                    <button onClick={handleClap} className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
                        <span className="text-xl">👏</span><span className="font-semibold">Clap</span>
                    </button>
                    <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
                        <span className="text-xl">💬</span><span className="font-semibold">Comment</span>
                    </button>
                    <button onClick={handleShare} className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
                        <span className="text-xl">📤</span><span className="font-semibold">Share</span>
                    </button>
                </div>
            </div>
            {showComments && (
                <div className="pt-4 mt-4 border-t border-gray-200">
                    <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
                        <textarea className="w-full p-2 text-sm border border-gray-300 rounded-lg" rows="1" placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)}></textarea>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Post</button>
                    </form>
                    <div className="mt-4 space-y-3">
                        {post.comments.map((comment, index) => (
                            <div key={index} className="p-3 text-sm bg-gray-100 rounded-lg">
                                <p className="font-semibold text-gray-800">{comment.name}</p>
                                <p className="text-gray-700">{comment.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
             {showSharePopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="p-8 bg-white rounded-lg shadow-xl max-w-sm w-full relative">
                        <button onClick={() => setShowSharePopup(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800">&times;</button>
                        <h3 className="text-xl font-bold mb-4">Share this post</h3>
                        <p className="text-sm text-gray-600 mb-4">Copy the link below to share this post with others.</p>
                        <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
                            <span className="text-sm truncate mr-2">{`${window.location.origin}/post/${post._id}`}</span>
                            <button onClick={copyToClipboard} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${isCopied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                                {isCopied ? 'Copied!' : 'Copy URL'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Post;