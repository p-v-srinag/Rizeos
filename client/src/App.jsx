import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register.jsx';
import Login from './components/login.jsx';
import Dashboard from './components/Dashboard.jsx';
import CreateJob from './components/CreateJob.jsx';
import JobsFeed from './components/JobsFeed.jsx';
import Feed from './components/Feed.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import { AuthContext } from './context/AuthContext.jsx';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-[#F8F9FA]">Loading...</div>;
  }
  return user ? children : <Navigate to="/login" />;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <div className="min-h-screen bg-[#F8F9FA] overflow-x-hidden">
        <Routes>
          <Route path="/" element={!user ? <Login /> : <Navigate to="/feed" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/feed" />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/feed" />} />
          
          {/* Protected Routes */}
          <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/create-job" element={<PrivateRoute><CreateJob /></PrivateRoute>} />
          <Route path="/jobs" element={<PrivateRoute><JobsFeed /></PrivateRoute>} />
          <Route path="/profile/:userId" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;