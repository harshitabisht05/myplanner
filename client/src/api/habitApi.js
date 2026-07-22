import axiosClient from './axiosClient';

export const habitApi = {
  getHabits: async (params = {}) => {
    const res = await axiosClient.get('/habits', { params });
    return res.data;
  },
  createHabit: async (habitData) => {
    const res = await axiosClient.post('/habits', habitData);
    return res.data;
  },
  updateHabit: async (id, habitData) => {
    const res = await axiosClient.put(`/habits/${id}`, habitData);
    return res.data;
  },
  deleteHabit: async (id) => {
    const res = await axiosClient.delete(`/habits/${id}`);
    return res.data;
  },
  toggleHabitCompletion: async (id, date) => {
    const res = await axiosClient.post(`/habits/${id}/toggle`, { date });
    return res.data;
  }
};
