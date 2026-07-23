import axiosClient from './axiosClient';

export const focusApi = {
  getSessions: async (params) => {
    const response = await axiosClient.get('/focus', { params });
    return response.data;
  },

  createSession: async (sessionData) => {
    const response = await axiosClient.post('/focus', sessionData);
    return response.data;
  },

  deleteSession: async (id) => {
    const response = await axiosClient.delete(`/focus/${id}`);
    return response.data;
  },

  getAnalytics: async () => {
    const response = await axiosClient.get('/focus/analytics');
    return response.data;
  }
};
