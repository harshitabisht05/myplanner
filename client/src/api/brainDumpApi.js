import axiosClient from './axiosClient';

export const brainDumpApi = {
  getBrainDumpItems: async (params = {}) => {
    const res = await axiosClient.get('/braindump', { params });
    return res.data;
  },
  createBrainDumpItem: async (itemData) => {
    const res = await axiosClient.post('/braindump', itemData);
    return res.data;
  },
  updateBrainDumpItem: async (id, itemData) => {
    const res = await axiosClient.put(`/braindump/${id}`, itemData);
    return res.data;
  },
  deleteBrainDumpItem: async (id) => {
    const res = await axiosClient.delete(`/braindump/${id}`);
    return res.data;
  },
  convertBrainDumpItem: async (id, convertData) => {
    const res = await axiosClient.post(`/braindump/${id}/convert`, convertData);
    return res.data;
  }
};
