import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate session / fetch profile on mount if token exists
  useEffect(() => {
    async function verifyAuth() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const profile = await authService.getProfile();
        setUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));
      } catch (err) {
        console.warn('Session expired or invalid token:', err);
        logout();
      } finally {
        setLoading(false);
      }
    }
    verifyAuth();
  }, [token]);

  const login = async (credentials) => {
    setError(null);
    try {
      const response = await authService.login(credentials);
      const { access_token, user: loggedUser } = response;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setToken(access_token);
      setUser(loggedUser);
      return response;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await authService.register(userData);
      return response;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        error,
        login,
        register,
        logout,
        refreshProfile,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
