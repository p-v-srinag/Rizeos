import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutStatus, setLogoutStatus] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setUser(null);
        } else {
          setUser({ token });
        }
      } catch (e) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (formData) => {
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      setUser({ token: res.data.token });
    } catch (err) {
      throw err;
    }
  };
  
  const register = async (formData) => {
    try {
      const res = await axios.post('http://localhost:5001/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      setUser({ token: res.data.token });
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setLogoutStatus(true);
  };
  
  const clearLogoutStatus = () => {
      setLogoutStatus(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, logoutStatus, clearLogoutStatus }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};