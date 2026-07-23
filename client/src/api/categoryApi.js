import axiosClient from './axiosClient';

export const categoryApi = {
  getCategories: async () => {
    const response = await axiosClient.get('/categories');
    return response.data;
  },

  createCategory: async (data) => {
    const response = await axiosClient.post('/categories', data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await axiosClient.delete(`/categories/${id}`);
    return response.data;
  }
};
