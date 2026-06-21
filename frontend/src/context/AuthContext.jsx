import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set the authorization token helper
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  // Check if token is valid on initial load only
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setToken(storedToken);
        } else {
          // Token is invalid or expired — clear it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to authenticate token:', err);
        // Network error: keep token, don't log out
        setToken(storedToken);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      localStorage.setItem('token', data.token);
      setUser(data.user);
      setToken(data.token);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Signup handler
  const signup = async (email, password) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      localStorage.setItem('token', data.token);
      setUser(data.user);
      setToken(data.token);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, signup, logout, getAuthHeaders, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
