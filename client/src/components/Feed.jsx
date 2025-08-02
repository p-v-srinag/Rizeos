import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Navbar from './Navbar.jsx';
import CreatePost from './CreatePost.jsx';
import Post from './Post.jsx';
import RecommendedJobs from './RecommendedJobs.jsx';
import { AuthContext } from '../context/AuthContext.jsx';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchPosts = async () => {
            if (!user) return;
            const token = localStorage.getItem('token');
            try {
                const config = { headers: { 'x-auth-token': token } };
                const res = await axios.get('http://localhost:5001/api/posts', config);
                setPosts(res.data);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchPosts();
    }, [user]);

    const addPostToFeed = (newPost) => setPosts([newPost, ...posts]);
    const updatePostInFeed = (updatedPost) => setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <Navbar />
            <main className="py-12">
                <div className="grid grid-cols-1 gap-8 px-4 mx-auto max-w-7xl lg:grid-cols-3">
                    
                    {/* Empty columns for centering on large screens */}
                    <div className="hidden lg:block"></div>

                    {/* Main Feed Content (Now Centered) */}
                    <div className="w-full max-w-2xl mx-auto lg:col-span-1">
                        <CreatePost addPostToFeed={addPostToFeed} />
                        <div className="mt-8">
                            {loading ? <p className="text-center text-gray-500">Loading feed...</p> : (
                                <div className="space-y-6">
                                    {posts.map(post => <Post key={post._id} postData={post} updatePostInFeed={updatePostInFeed} />)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Empty column for centering */}
                    <div className="hidden lg:block"></div>
                </div>
            </main>
        </div>
    );
};
export default Feed;