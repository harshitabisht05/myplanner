import axiosClient from './axiosClient';

export const moodApi = {
  getMoods: async (params = {}) => {
    const res = await axiosClient.get('/moods', { params });
    return res.data;
  },
  setMood: async (moodData) => {
    const res = await axiosClient.post('/moods', moodData);
    return res.data;
  }
};
