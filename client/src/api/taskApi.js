import axiosClient from './axiosClient';

export const taskApi = {
  getTasks: async (params = {}) => {
    const res = await axiosClient.get('/tasks', { params });
    return res.data;
  },
  getTaskById: async (id) => {
    const res = await axiosClient.get(`/tasks/${id}`);
    return res.data;
  },
  createTask: async (taskData) => {
    const res = await axiosClient.post('/tasks', taskData);
    return res.data;
  },
  updateTask: async (id, taskData) => {
    const res = await axiosClient.put(`/tasks/${id}`, taskData);
    return res.data;
  },
  toggleTaskComplete: async (id) => {
    const res = await axiosClient.patch(`/tasks/${id}/toggle`);
    return res.data;
  },
  deleteTask: async (id) => {
    const res = await axiosClient.delete(`/tasks/${id}`);
    return res.data;
  }
};
