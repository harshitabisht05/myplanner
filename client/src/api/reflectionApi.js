import axiosClient from './axiosClient';

export const reflectionApi = {
  getReflections: async (params = {}) => {
    const res = await axiosClient.get('/reflections', { params });
    return res.data;
  },
  saveReflection: async (reflectionData) => {
    const res = await axiosClient.post('/reflections', reflectionData);
    return res.data;
  }
};
