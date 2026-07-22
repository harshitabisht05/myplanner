import axiosClient from './axiosClient';

export const dailyNoteApi = {
  getDailyNote: async (date) => {
    const res = await axiosClient.get('/dailynote', { params: { date } });
    return res.data;
  },
  saveDailyNote: async (date, content) => {
    const res = await axiosClient.post('/dailynote', { date, content });
    return res.data;
  }
};
