import api from './axiosClient';

export const workspaceApi = {
  // Workspaces
  getWorkspaces: async () => {
    const res = await api.get('/workspaces');
    return res.data;
  },
  createWorkspace: async (data) => {
    const res = await api.post('/workspaces', data);
    return res.data;
  },
  getWorkspaceById: async (workspaceId) => {
    const res = await api.get(`/workspaces/${workspaceId}`);
    return res.data;
  },
  updateWorkspace: async (workspaceId, data) => {
    const res = await api.put(`/workspaces/${workspaceId}`, data);
    return res.data;
  },
  deleteWorkspace: async (workspaceId) => {
    const res = await api.delete(`/workspaces/${workspaceId}`);
    return res.data;
  },
  getWorkspaceStats: async (workspaceId) => {
    const res = await api.get(`/workspaces/${workspaceId}/stats`);
    return res.data;
  },
  searchWorkspace: async (workspaceId, q) => {
    const res = await api.get(`/workspaces/${workspaceId}/search?q=${encodeURIComponent(q)}`);
    return res.data;
  },

  // Members
  addMember: async (workspaceId, memberData) => {
    const res = await api.post(`/workspaces/${workspaceId}/members`, memberData);
    return res.data;
  },
  updateMemberRole: async (workspaceId, userId, roleData) => {
    const res = await api.put(`/workspaces/${workspaceId}/members/${userId}`, roleData);
    return res.data;
  },
  removeMember: async (workspaceId, userId) => {
    const res = await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
    return res.data;
  },

  // Projects
  getProjects: async (workspaceId) => {
    const res = await api.get(`/workspaces/${workspaceId}/projects`);
    return res.data;
  },
  createProject: async (workspaceId, data) => {
    const res = await api.post(`/workspaces/${workspaceId}/projects`, data);
    return res.data;
  },
  getProjectById: async (workspaceId, projectId) => {
    const res = await api.get(`/workspaces/${workspaceId}/projects/${projectId}`);
    return res.data;
  },
  updateProject: async (workspaceId, projectId, data) => {
    const res = await api.put(`/workspaces/${workspaceId}/projects/${projectId}`, data);
    return res.data;
  },
  deleteProject: async (workspaceId, projectId) => {
    const res = await api.delete(`/workspaces/${workspaceId}/projects/${projectId}`);
    return res.data;
  },

  // Tasks
  getTasks: async (workspaceId, params = {}) => {
    const res = await api.get(`/workspaces/${workspaceId}/tasks`, { params });
    return res.data;
  },
  createTask: async (workspaceId, data) => {
    const res = await api.post(`/workspaces/${workspaceId}/tasks`, data);
    return res.data;
  },
  getTaskById: async (workspaceId, taskId) => {
    const res = await api.get(`/workspaces/${workspaceId}/tasks/${taskId}`);
    return res.data;
  },
  updateTask: async (workspaceId, taskId, data) => {
    const res = await api.put(`/workspaces/${workspaceId}/tasks/${taskId}`, data);
    return res.data;
  },
  deleteTask: async (workspaceId, taskId) => {
    const res = await api.delete(`/workspaces/${workspaceId}/tasks/${taskId}`);
    return res.data;
  },
  addComment: async (workspaceId, taskId, data) => {
    const res = await api.post(`/workspaces/${workspaceId}/tasks/${taskId}/comments`, data);
    return res.data;
  },

  // Sprints
  getSprints: async (workspaceId) => {
    const res = await api.get(`/workspaces/${workspaceId}/sprints`);
    return res.data;
  },
  createSprint: async (workspaceId, data) => {
    const res = await api.post(`/workspaces/${workspaceId}/sprints`, data);
    return res.data;
  },
  updateSprint: async (workspaceId, sprintId, data) => {
    const res = await api.put(`/workspaces/${workspaceId}/sprints/${sprintId}`, data);
    return res.data;
  },
  getSprintSummary: async (workspaceId, sprintId) => {
    const res = await api.get(`/workspaces/${workspaceId}/sprints/${sprintId}/summary`);
    return res.data;
  },

  // Chat
  getChannels: async (workspaceId) => {
    const res = await api.get(`/workspaces/${workspaceId}/chat/channels`);
    return res.data;
  },
  createChannel: async (workspaceId, data) => {
    const res = await api.post(`/workspaces/${workspaceId}/chat/channels`, data);
    return res.data;
  },
  getMessages: async (workspaceId, params = {}) => {
    const res = await api.get(`/workspaces/${workspaceId}/chat/messages`, { params });
    return res.data;
  },
  sendMessage: async (workspaceId, data) => {
    const res = await api.post(`/workspaces/${workspaceId}/chat/messages`, data);
    return res.data;
  },
  addReaction: async (workspaceId, messageId, data) => {
    const res = await api.post(`/workspaces/${workspaceId}/chat/messages/${messageId}/reactions`, data);
    return res.data;
  },
  togglePin: async (workspaceId, messageId) => {
    const res = await api.put(`/workspaces/${workspaceId}/chat/messages/${messageId}/pin`);
    return res.data;
  },

  // Files
  getFiles: async (workspaceId, params = {}) => {
    const res = await api.get(`/workspaces/${workspaceId}/files`, { params });
    return res.data;
  },
  uploadFile: async (workspaceId, data) => {
    const res = await api.post(`/workspaces/${workspaceId}/files`, data);
    return res.data;
  },
  deleteFile: async (workspaceId, fileId) => {
    const res = await api.delete(`/workspaces/${workspaceId}/files/${fileId}`);
    return res.data;
  },

  // Activity
  getActivities: async (workspaceId) => {
    const res = await api.get(`/workspaces/${workspaceId}/activity`);
    return res.data;
  }
};
