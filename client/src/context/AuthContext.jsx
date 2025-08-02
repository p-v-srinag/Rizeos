import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (formData) => {
    // Note: The URL is hardcoded for local testing. This should be a dynamic environment variable for production.
    const res = await axios.post('http://localhost:5001/api/auth/login', formData);
    localStorage.setItem('token', res.data.token);
    setUser({ token: res.data.token });
  };
  
  const register = async (formData) => {
    // Note: The URL is hardcoded for local testing. This should be a dynamic environment variable for production.
    const res = await axios.post('http://localhost:5001/api/auth/register', formData);
    localStorage.setItem('token', res.data.token);
    setUser({ token: res.data.token });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};