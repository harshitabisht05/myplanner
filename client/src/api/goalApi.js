import axiosClient from './axiosClient';

export const goalApi = {
  getGoals: async () => {
    const res = await axiosClient.get('/goals');
    return res.data;
  },
  createGoal: async (goalData) => {
    const res = await axiosClient.post('/goals', goalData);
    return res.data;
  },
  updateGoal: async (id, goalData) => {
    const res = await axiosClient.put(`/goals/${id}`, goalData);
    return res.data;
  },
  deleteGoal: async (id) => {
    const res = await axiosClient.delete(`/goals/${id}`);
    return res.data;
  },
  addMilestone: async (goalId, milestoneData) => {
    const res = await axiosClient.post(`/goals/${goalId}/milestones`, milestoneData);
    return res.data;
  },
  updateMilestone: async (goalId, milestoneId, milestoneData) => {
    const res = await axiosClient.put(`/goals/${goalId}/milestones/${milestoneId}`, milestoneData);
    return res.data;
  },
  deleteMilestone: async (goalId, milestoneId) => {
    const res = await axiosClient.delete(`/goals/${goalId}/milestones/${milestoneId}`);
    return res.data;
  }
};
