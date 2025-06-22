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

  // Get employee personal data
  getEmployeePersonal: async (id) => {
    const res = await api.get(`/employees/${id}/personal`);
    return res.data;
  },

  // Get employee secondary data
  getEmployeeSecondary: async (id) => {
    const res = await api.get(`/employees/${id}/secondary`);
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

  // Update employee personal data
  updateEmployeePersonal: async (id, personalData) => {
    const res = await api.post(`/employees/${id}/personal`, personalData);
    return res.data;
  },

  // Update employee secondary data
  updateEmployeeSecondary: async (id, secondaryData) => {
    const res = await api.post(`/employees/${id}/secondary`, secondaryData);
    return res.data;
  },

  // Upload profile picture
  uploadProfile: async (id, file, fileType) => {
    const res = await api.post(`/employees/${id}/profile`, {
      file,
      fileType
    });
    return res.data;
  },

  // Get bank details
  getBankDetails: async (id) => {
    const res = await api.get(`/employees/${id}/bank`);
    return res.data;
  },

  // Update bank details
  updateBankDetails: async (id, bankDetails) => {
    const res = await api.post(`/employees/${id}/bank`, bankDetails);
    return res.data;
  },

  // Get documents
  getDocuments: async (id) => {
    const res = await api.get(`/employees/${id}/documents`);
    return res.data;
  },

  // Upload document
  uploadDocument: async (id, document) => {
    const res = await api.post(`/employees/${id}/documents`, document);
    return res.data;
  },

  // Update document
  updateDocument: async (id, documentId, document) => {
    const res = await api.put(`/employees/${id}/documents/${documentId}`, document);
    return res.data;
  },

  // Delete document
  deleteDocument: async (id, documentId) => {
    const res = await api.delete(`/employees/${id}/documents/${documentId}`);
    return res.data;
  },

  // Update document status
  updateDocumentStatus: async (id, documentId, status, remarks) => {
    const res = await api.put(`/employees/${id}/documents/${documentId}/status`, {
      status,
      remarks
    });
    return res.data;
  }
}; 