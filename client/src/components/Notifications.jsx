import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Notifications = ({ close }) => {
    const [notifications, setNotifications] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            try {
                const res = await axios.get('http://localhost:5001/api/profile/notifications', config);
                setNotifications(res.data);
            } catch (err) { 
                console.error(err); 
            }
        };
        if (user) fetchNotifications();
    }, [user]);

    const handleAction = async (notificationId, action) => {
        const token = localStorage.getItem('token');
        try {
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`http://localhost:5001/api/profile/notifications/${notificationId}`, { action }, config);
            
            // Remove the notification from the state after a successful action
            setNotifications(notifications.filter(notif => notif._id !== notificationId));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="absolute right-0 w-80 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="p-2 font-bold border-b">Notifications</div>
            <div className="py-1 max-h-80 overflow-y-auto">
                {notifications.length > 0 ? notifications.map(notif => (
                    <div key={notif._id} className="flex flex-col p-4 text-sm text-gray-700 border-b last:border-b-0">
                        <span className="font-semibold">{notif.message}</span>
                        {notif.type === 'job_application' && (
                            <div className="flex space-x-2 mt-2">
                                <Link to={`/jobs/applications/${notif.jobId}`} className="px-3 py-1 text-xs text-white bg-blue-600 rounded-full hover:bg-blue-700">View Applicant</Link>
                            </div>
                        )}
                        {notif.type === 'connection_request' && (
                            <div className="flex space-x-2 mt-2">
                                <button onClick={() => handleAction(notif._id, 'accept')} className="px-3 py-1 text-xs text-white bg-green-600 rounded-full hover:bg-green-700">Accept</button>
                                <button onClick={() => handleAction(notif._id, 'decline')} className="px-3 py-1 text-xs text-white bg-red-600 rounded-full hover:bg-red-700">Decline</button>
                            </div>
                        )}
                    </div>
                )) : <div className="p-4 text-sm text-center text-gray-500">No new notifications.</div>}
            </div>
        </div>
    );
};
export default Notifications;