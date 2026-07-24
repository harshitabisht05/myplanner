import axiosClient from './axiosClient';

export const notificationApi = {
  getNotifications: async () => {
    const response = await axiosClient.get('/notifications');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await axiosClient.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axiosClient.put('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await axiosClient.delete(`/notifications/${id}`);
    return response.data;
  },

  sendTestEmail: async () => {
    const response = await axiosClient.post('/notifications/test-email');
    return response.data;
  },

  sendTestBrowser: async () => {
    const response = await axiosClient.post('/notifications/test-browser');
    return response.data;
  }
};
