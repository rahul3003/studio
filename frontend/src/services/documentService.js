import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const documentService = {
  // Get all documents for an employee
  getDocuments: async (employeeId) => {
    try {
      const response = await axios.get(`${API_URL}/employees/${employeeId}/documents`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload a new document
  uploadDocument: async (employeeId, document) => {
    try {
      const response = await axios.post(`${API_URL}/employees/${employeeId}/documents`, document, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update an existing document
  updateDocument: async (employeeId, documentId, document) => {
    try {
      const response = await axios.put(`${API_URL}/employees/${employeeId}/documents/${documentId}`, document, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a document
  deleteDocument: async (employeeId, documentId, reason) => {
    try {
      const response = await axios.delete(`${API_URL}/employees/${employeeId}/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        data: { reason }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update document status
  updateDocumentStatus: async (employeeId, documentId, status, remarks) => {
    try {
      const response = await axios.put(
        `${API_URL}/employees/${employeeId}/documents/${documentId}/status`,
        { status, remarks },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default documentService; 