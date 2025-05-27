import api from './api';

export const reimbursementService = {
  getAll: async () => {
    const res = await api.get('/reimbursements');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/reimbursements/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/reimbursements', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/reimbursements/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/reimbursements/${id}`);
    return res.data;
  },
  addComment: async (id, comment, user) => {
    const res = await api.post(`/reimbursements/${id}/comments`, { text: comment, user });
    return res.data;
  },
  addHistoryEntry: async (id, entry) => {
    const res = await api.post(`/reimbursements/${id}/history`, entry);
    return res.data;
  },
  getPresignedUrl: async (fileName, contentType) => {
    const res = await api.post('/reimbursements/upload/presigned-url', { fileName, contentType });
    return res.data;
  },
}; 