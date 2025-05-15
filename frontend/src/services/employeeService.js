import api from '@/services/api';

export const employeeService = {
  // Get all employees
  getAllEmployees: async () => {
    const res = await api.get('/employees');
    return res.data;
  },

  // Get employee by ID
  getEmployeeById: async (id) => {
    const res = await api.get(`/employees/${id}`);
    return res.data;
  },

  // Create new employee
  createEmployee: async (employeeData) => {
    const res = await api.post('/employees', employeeData);
    return res.data;
  },

  // Update employee
  updateEmployee: async (id, employeeData) => {
    const res = await api.put(`/employees/${id}`, employeeData);
    return res.data;
  },

  // Delete employee
  deleteEmployee: async (id) => {
    const res = await api.delete(`/employees/${id}`);
    return res.data;
  },
}; 