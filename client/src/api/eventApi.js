import axiosClient from './axiosClient';

export const eventApi = {
  getEvents: async (params = {}) => {
    const res = await axiosClient.get('/events', { params });
    return res.data;
  },
  createEvent: async (eventData) => {
    const res = await axiosClient.post('/events', eventData);
    return res.data;
  },
  updateEvent: async (id, eventData) => {
    const res = await axiosClient.put(`/events/${id}`, eventData);
    return res.data;
  },
  deleteEvent: async (id) => {
    const res = await axiosClient.delete(`/events/${id}`);
    return res.data;
  }
};
