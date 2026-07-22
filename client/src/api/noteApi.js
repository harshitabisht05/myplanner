import axiosClient from './axiosClient';

export const noteApi = {
  getNotes: async (params = {}) => {
    const res = await axiosClient.get('/notes', { params });
    return res.data;
  },
  createNote: async (noteData) => {
    const res = await axiosClient.post('/notes', noteData);
    return res.data;
  },
  updateNote: async (id, noteData) => {
    const res = await axiosClient.put(`/notes/${id}`, noteData);
    return res.data;
  },
  togglePinNote: async (id) => {
    const res = await axiosClient.patch(`/notes/${id}/pin`);
    return res.data;
  },
  deleteNote: async (id) => {
    const res = await axiosClient.delete(`/notes/${id}`);
    return res.data;
  }
};
