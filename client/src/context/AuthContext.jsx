import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dealpilot_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.success) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('dealpilot_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const demoLogin = async (role = 'buyer') => {
    const res = await api.demoLogin(role);
    if (res.success && res.token) {
      localStorage.setItem('dealpilot_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Demo login failed');
  };

  const register = async (payload) => {
    const res = await api.register(payload);
    if (res.success && res.token) {
      localStorage.setItem('dealpilot_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('dealpilot_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        loading,
        login,
        demoLogin,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
