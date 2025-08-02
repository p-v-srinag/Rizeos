import React, { useState, useContext, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import Notifications from './Notifications.jsx';

const Navbar = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [notificationRef]);

    const activeLinkStyle = { color: '#2563EB', borderBottom: '2px solid #2563EB' };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <NavLink to="/feed" className="text-2xl font-bold text-blue-600">RizeOS</NavLink>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <NavLink to="/feed" className="px-1 py-5 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-900" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Feed</NavLink>
                        <NavLink to="/jobs" className="px-1 py-5 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-900" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Jobs</NavLink>
                        <NavLink to="/create-job" className="px-1 py-5 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-900" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Post a Job</NavLink>
                        <NavLink to="/dashboard" className="px-1 py-5 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-900" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>My Profile</NavLink>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="relative" ref={notificationRef}>
                            <button onClick={() => setShowNotifications(!showNotifications)} className="p-1 text-gray-400 bg-white rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                            </button>
                            {showNotifications && <Notifications close={() => setShowNotifications(false)} />}
                        </div>
                        <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">Logout</button>
                    </div>
                </div>
            </div>
        </header>
    );
};
export default Navbar;
