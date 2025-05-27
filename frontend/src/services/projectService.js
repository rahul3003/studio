import api from './api';

const projectService = {
  // Get all projects with optional filters
  getAll: async (filters = {}) => {
    const response = await api.get('/projects', { params: filters });
    return response.data.data;
  },

  // Get a specific project by ID
  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Create a new project
  create: async (data) => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  // Update a project
  update: async (id, data) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  // Delete a project
  delete: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  // Add a team member to a project
  addTeamMember: async (projectId, employeeId) => {
    const response = await api.post(`/projects/${projectId}/members`, { employeeId });
    return response.data;
  },

  // Remove a team member from a project
  removeTeamMember: async (projectId, employeeId) => {
    const response = await api.delete(`/projects/${projectId}/members`, { data: { employeeId } });
    return response.data;
  },

  // Get team members for a project
  getTeamMembers: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/members`);
    return response.data;
  },
};

export default projectService; 