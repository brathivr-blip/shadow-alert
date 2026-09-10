import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

// DEMO MODE – Remove before production.
const DEMO_TOKEN = 'demo-token';

// DEMO MODE – Remove before production.
function createDemoUser(email) {
  const normalizedEmail = (email || '').trim().toLowerCase() || 'demo@shadowalert.com';
  const namePart = normalizedEmail.split('@')[0] || 'Demo User';
  const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

  return {
    _id: 'demo-user',
    name: displayName,
    email: normalizedEmail,
    role: 'citizen',
    points: 0,
    avatarColor: '#34D399',
  };
}

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

    // DEMO MODE – Remove before production.
    // Restore demo session from localStorage without calling the backend.
    if (token === DEMO_TOKEN) {
      const stored = localStorage.getItem('shadowalert_user');
      setUser(stored ? JSON.parse(stored) : createDemoUser('demo@shadowalert.com'));
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

  const login = useCallback(async (email) => {
    // DEMO MODE – Remove before production.
    // Accept any email/password; do not validate against MongoDB or any API.
    const demoUser = createDemoUser(email);
    localStorage.setItem('shadowalert_token', DEMO_TOKEN);
    localStorage.setItem('shadowalert_user', JSON.stringify(demoUser));
    setUser(demoUser);
    return demoUser;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('shadowalert_token', data.token);
    localStorage.setItem('shadowalert_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const token = localStorage.getItem('shadowalert_token');

    // DEMO MODE – Remove before production.
    if (token === DEMO_TOKEN) {
      const stored = localStorage.getItem('shadowalert_user');
      const current = stored ? JSON.parse(stored) : createDemoUser('demo@shadowalert.com');
      const updated = { ...current, ...payload };
      localStorage.setItem('shadowalert_user', JSON.stringify(updated));
      setUser(updated);
      return updated;
    }

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
