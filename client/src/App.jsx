import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register.jsx';
import Login from './components/login.jsx';
import Dashboard from './components/Dashboard.jsx';
import CreateJob from './components/CreateJob.jsx';
import JobsFeed from './components/JobsFeed.jsx';
import { AuthContext } from './context/AuthContext.jsx';

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/create-job" element={<PrivateRoute><CreateJob /></PrivateRoute>} />
        <Route path="/jobs" element={<PrivateRoute><JobsFeed /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}
export default App;