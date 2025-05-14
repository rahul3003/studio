import { create } from 'zustand';
import api from '@/services/api';

export const useApplicantStore = create((set, get) => ({
  applicants: [],
  _initializeApplicants: async () => {
    const { data } = await api.get('/applicants');
    set({ applicants: data });
  },
  getApplicantsByJobId: (jobId) => get().applicants.filter(app => app.jobPostingId === jobId),
  getApplicantById: (id) => get().applicants.find(app => app.id === id),
  addApplicant: async (applicant) => {
    const { data } = await api.post('/applicants', applicant);
    set((state) => ({ applicants: [...state.applicants, data.data] }));
  },
  updateApplicant: async (id, updatedData) => {
    const { data } = await api.put(`/applicants/${id}`, updatedData);
    set((state) => ({
      applicants: state.applicants.map(app => app.id === id ? data.data : app)
    }));
      },
  deleteApplicant: async (id) => {
    await api.delete(`/applicants/${id}`);
        set((state) => ({
      applicants: state.applicants.filter(app => app.id !== id)
        }));
      },
  addNoteToApplicant: async (id, noteText) => {
    const applicant = get().getApplicantById(id);
    const updatedNotes = [...(applicant.notes || []), { text: noteText, date: new Date().toISOString() }];
    await get().updateApplicant(id, { notes: updatedNotes });
        }
}));
