import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const Navbar = () => {
    const { logout } = React.useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const activeLinkStyle = {
        color: '#2563EB',
        borderBottom: '2px solid #2563EB'
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <NavLink to="/dashboard" className="text-2xl font-bold text-blue-600">RizeOS</NavLink>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <NavLink to="/jobs" className="px-1 py-5 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-900 transition-colors" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Job Feed</NavLink>
                        <NavLink to="/create-job" className="px-1 py-5 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-900 transition-colors" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Post a Job</NavLink>
                        <NavLink to="/dashboard" className="px-1 py-5 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-900 transition-colors" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>My Profile</NavLink>
                    </div>
                    <div className="flex items-center">
                        <button 
                            onClick={handleLogout} 
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
export default Navbar;