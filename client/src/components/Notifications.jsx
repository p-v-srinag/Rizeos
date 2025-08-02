import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

const Notifications = ({ close }) => {
    const [requests, setRequests] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchRequests = async () => {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            try {
                const res = await axios.get('http://localhost:5001/api/profile/me', config);
                const requesters = await Promise.all(
                    res.data.connectionRequests.map(req => 
                        axios.get(`http://localhost:5001/api/profiles/${req.from}`, config)
                    )
                );
                setRequests(requesters.map(r => r.data));
            } catch (err) { console.error(err); }
        };
        if (user) fetchRequests();
    }, [user]);

    const handleAccept = async (senderId) => {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        try {
            await axios.put(`http://localhost:5001/api/profiles/accept/${senderId}`, {}, config);
            alert('Request accepted!');
            setRequests(requests.filter(req => req._id !== senderId));
        } catch (err) { console.error(err); }
    };
    
    return (
        <div className="absolute right-0 w-80 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5" onClick={(e) => e.stopPropagation()}>
            <div className="p-2 font-bold border-b">Interaction Requests</div>
            <div className="py-1">
                {requests.length > 0 ? requests.map(request => (
                    <div key={request._id} className="flex items-center justify-between px-4 py-2 text-sm text-gray-700">
                        <span className="font-semibold">{request.name}</span>
                        <button onClick={() => handleAccept(request._id)} className="px-3 py-1 text-xs text-white bg-blue-600 rounded-full hover:bg-blue-700">Accept</button>
                    </div>
                )) : <div className="p-4 text-sm text-center text-gray-500">No new notifications.</div>}
            </div>
        </div>
    );
};
export default Notifications;