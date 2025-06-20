import { create } from 'zustand';
import api from '@/services/api';
import moment from 'moment';
import { s3Service } from '@/services/s3Service';

function createHistoryEntry(status, details = "") {
  return {
    status,
    timestamp: new Date().toISOString(),
    details,
  };
}

function toIsoDateTimeWithMoment(date) {
  if (!date) return undefined;
  const m = moment(date, [moment.ISO_8601, 'YYYY-MM-DD', 'YYYY-MM-DDTHH:mm:ssZ', 'MMMM D, YYYY']);
  return m.isValid() ? m.toISOString() : undefined;
}

export const useApplicantStore = create((set, get) => ({
  applicants: [],
  loading: false,
  error: null,

  initializeApplicants: async () => {
    set({ loading: true, error: null });
    try {
    const { data } = await api.get('/applicants');
      console.log("applicants", data);
      set({ applicants: data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch applicants', 
        loading: false 
      });
    }
  },

  getApplicantsByJobId: (jobId) => get().applicants.filter(app => app.jobPostingId === jobId),
  getApplicantById: (id) => get().applicants.find(app => app.id === id),
  
  addApplicant: async (applicant) => {
    set({ loading: true, error: null });
    try {
      const {
        resumeFile,
        resumeUrl,
        resumeLink,
        jobId,
        offerStatus,
        ...rest
      } = applicant;

      const status = offerStatus || 'PENDING_OFFER';
      const dataToSend = {
        ...rest,
        jobPostingId: jobId,
        offerStatus: status,
        resumeLink: resumeLink || resumeUrl || null,
        offerHistory: [createHistoryEntry(status, 'Applicant created')],
        ...(rest.offeredStartDate && { offeredStartDate: toIsoDateTimeWithMoment(rest.offeredStartDate) }),
      };

      const { data } = await api.post('/applicants', dataToSend);
      
      // If there's a resume file, upload it after creating the applicant
      if (resumeFile) {
        await get().uploadResume(data.data.id, resumeFile);
      }

      set((state) => ({ 
        applicants: [...state.applicants, data.data],
        loading: false 
      }));
      return { success: true, data: data.data };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to add applicant', 
        loading: false 
      });
      return { success: false, error: error.response?.data?.message || 'Failed to add applicant' };
    }
  },

  updateApplicant: async (id, updatedData) => {
    set({ loading: true, error: null });
    try {
      const applicant = get().getApplicantById(id);
      let newHistory = applicant.offerHistory || [];
      // If offerStatus is changing, append to history
      if (updatedData.offerStatus && updatedData.offerStatus !== applicant.offerStatus) {
        newHistory = [
          ...newHistory,
          createHistoryEntry(updatedData.offerStatus, updatedData.details || ''),
        ];
      }
      const { data } = await api.put(`/applicants/${id}`, {
        ...updatedData,
        offerHistory: newHistory,
        ...(updatedData.offeredStartDate && { offeredStartDate: toIsoDateTimeWithMoment(updatedData.offeredStartDate) }),
      });
    set((state) => ({
        applicants: state.applicants.map(app => app.id === id ? data.data : app),
        loading: false
    }));
      return { success: true, data: data.data };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update applicant', 
        loading: false 
      });
      return { success: false, error: error.response?.data?.message || 'Failed to update applicant' };
    }
      },

  deleteApplicant: async (id) => {
    set({ loading: true, error: null });
    try {
    await api.delete(`/applicants/${id}`);
        set((state) => ({
        applicants: state.applicants.filter(app => app.id !== id),
        loading: false
        }));
      return { success: true };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete applicant', 
        loading: false 
      });
      return { success: false, error: error.response?.data?.message || 'Failed to delete applicant' };
    }
      },

  addNoteToApplicant: async (id, noteText) => {
    const applicant = get().getApplicantById(id);
    const updatedNotes = [...(applicant.notes || []), { text: noteText, date: new Date().toISOString() }];
    return get().updateApplicant(id, { notes: updatedNotes });
  },

  clearError: () => set({ error: null }),

  // Add a new function to handle resume upload separately
  uploadResume: async (applicantId, resumeFile) => {
    try {
      let resumeUrl;
      if (resumeFile.size > 5 * 1024 * 1024) {
        // Large file: get presigned URL and upload directly to S3
        const { data: presignedData } = await api.post('/s3/presigned-url', {
          filename: resumeFile.name,
          filetype: resumeFile.type,
        });
        await s3Service.uploadFileDirectly(resumeFile, presignedData.presignedUrl);
        resumeUrl = presignedData.url;
      } else {
        // Small file: upload through server
        const formData = new FormData();
        formData.append('file', resumeFile);
        const { data } = await api.post('/s3/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        resumeUrl = data.url;
      }
      // Update applicant with resume URL
      return get().updateApplicant(applicantId, { resumeLink: resumeUrl });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload resume');
    }
  },
}));
