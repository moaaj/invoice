import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // You would typically validate the token here
      setUser({ email: 'user@example.com' }); // Replace with actual user data
    }
  }, []);

  const login = async (email, password) => {
    try {
      // In a real app, you would make an API call here
      // For demo purposes, we'll just simulate a successful login
      if (email && password) {
        const token = 'demo-token';
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
        setUser({ email });
        return true;
      }
      throw new Error('Invalid credentials');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 