import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { useTheme } from './ThemeContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { updatePreferencesFromUser } = useTheme();

  // Check current authenticated session on app load
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      const token = localStorage.getItem('planner_token');
      if (!token) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }
      try {
        const data = await authApi.getMe();
        if (isMounted && data.success && data.user) {
          setUser(data.user);
          if (data.user.preferences) {
            updatePreferencesFromUser(data.user.preferences);
          }
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    if (data.success && data.user) {
      if (data.token) {
        localStorage.setItem('planner_token', data.token);
      }
      setUser(data.user);
      if (data.user.preferences) {
        updatePreferencesFromUser(data.user.preferences);
      }
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    if (data.success && data.user) {
      if (data.token) {
        localStorage.setItem('planner_token', data.token);
      }
      setUser(data.user);
      if (data.user.preferences) {
        updatePreferencesFromUser(data.user.preferences);
      }
    }
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('planner_token');
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    const data = await authApi.updateProfile(profileData);
    if (data.success && data.user) {
      setUser(data.user);
    }
    return data;
  };

  const updatePreferences = async (prefData) => {
    const data = await authApi.updatePreferences(prefData);
    if (data.success && data.user) {
      setUser(data.user);
      if (data.user.preferences) {
        updatePreferencesFromUser(data.user.preferences);
      }
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        updatePreferences
      }}
    >
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
