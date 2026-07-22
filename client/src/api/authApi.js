import axiosClient from './axiosClient';

export const authApi = {
  register: async (userData) => {
    const res = await axiosClient.post('/auth/register', userData);
    return res.data;
  },
  login: async (credentials) => {
    const res = await axiosClient.post('/auth/login', credentials);
    return res.data;
  },
  logout: async () => {
    const res = await axiosClient.post('/auth/logout');
    return res.data;
  },
  getMe: async () => {
    const res = await axiosClient.get('/auth/me');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await axiosClient.put('/auth/profile', data);
    return res.data;
  },
  updatePreferences: async (preferences) => {
    const res = await axiosClient.put('/auth/preferences', preferences);
    return res.data;
  },
  forgotPassword: async (email) => {
    const res = await axiosClient.post('/auth/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (resetToken, password) => {
    const res = await axiosClient.post(`/auth/reset-password/${resetToken}`, { password });
    return res.data;
  }
};
