import { create } from 'zustand';
import documentService from '@/services/documentService';

const useDocumentStore = create((set, get) => ({
  documents: [],
  loading: false,
  error: null,

  // Fetch documents for an employee
  fetchDocuments: async (employeeId) => {
    try {
      set({ loading: true, error: null });
      const response = await documentService.getDocuments(employeeId);
      set({ documents: response.data, loading: false });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Upload a new document
  uploadDocument: async (employeeId, document) => {
    try {
      set({ loading: true, error: null });
      const response = await documentService.uploadDocument(employeeId, document);
      set(state => ({
        documents: [...state.documents, response.data],
        loading: false
      }));
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update an existing document
  updateDocument: async (employeeId, documentId, document) => {
    try {
      set({ loading: true, error: null });
      const response = await documentService.updateDocument(employeeId, documentId, document);
      set(state => ({
        documents: state.documents.map(doc => 
          doc.id === documentId ? response.data : doc
        ),
        loading: false
      }));
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete a document
  deleteDocument: async (employeeId, documentId, reason) => {
    try {
      set({ loading: true, error: null });
      await documentService.deleteDocument(employeeId, documentId, reason);
      set(state => ({
        documents: state.documents.filter(doc => doc.id !== documentId),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update document status
  updateDocumentStatus: async (employeeId, documentId, status, remarks) => {
    try {
      set({ loading: true, error: null });
      const response = await documentService.updateDocumentStatus(employeeId, documentId, status, remarks);
      set(state => ({
        documents: state.documents.map(doc => 
          doc.id === documentId ? response.data : doc
        ),
        loading: false
      }));
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Clear documents
  clearDocuments: () => set({ documents: [], loading: false, error: null })
}));

export default useDocumentStore; 