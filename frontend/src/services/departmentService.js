import api from '@/services/api';

export const departmentService = {
  // Get all departments
  getAllDepartments: async () => {
    try {
      const response = await api.get('/departments');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new department
  createDepartment: async (departmentData) => {
    try {
      const response = await api.post('/departments', departmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update department
  updateDepartment: async (departmentId, departmentData) => {
    try {
      const response = await api.put(`/departments/${departmentId}`, departmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete department
  deleteDepartment: async (departmentId) => {
    try {
      const response = await api.delete(`/departments/${departmentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 