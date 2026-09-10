import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);
// Demo Mode
const DEMO_EMAIL = 'demo@shadowalert.com';
const DEMO_PASSWORD = 'Shadow@2026';
const DEMO_TOKEN = 'demo-header.demo-payload.demo-signature';
const DEMO_USER = {
  _id: 'demo-user',
  name: 'Demo User',
  email: DEMO_EMAIL,
  role: 'citizen',
  points: 0,
  avatarColor: '#34D399',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('shadowalert_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('shadowalert_token');
    if (!token) {
      setLoading(false);
      return;
    }
    if (token === DEMO_TOKEN) {
      setUser(DEMO_USER);
      localStorage.setItem('shadowalert_user', JSON.stringify(DEMO_USER));
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem('shadowalert_user', JSON.stringify(data.user));
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    // Demo Mode
    if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      localStorage.setItem('shadowalert_token', DEMO_TOKEN);
      localStorage.setItem('shadowalert_user', JSON.stringify(DEMO_USER));
      setUser(DEMO_USER);
      return DEMO_USER;
    }

    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('shadowalert_token', data.token);
    localStorage.setItem('shadowalert_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('shadowalert_token', data.token);
    localStorage.setItem('shadowalert_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const { data } = await api.put('/auth/me', payload);
    localStorage.setItem('shadowalert_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('shadowalert_token');
    localStorage.removeItem('shadowalert_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
