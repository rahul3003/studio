import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/services/api';

const initialJobsMock = [
  {
    id: "JOB001",
    title: "Senior Frontend Developer",
    department: "Technology",
    location: "Remote",
    type: "Full-time",
    description: "Join our dynamic team to build cutting-edge user interfaces with modern web technologies. You will be responsible for developing and maintaining web applications, collaborating with UI/UX designers and backend developers.",
    requirements: "5+ years of experience with React, Next.js, and TypeScript. Strong understanding of HTML, CSS, and JavaScript. Experience with RESTful APIs and version control (Git).",
    postedDate: "2024-07-20",
    status: "Open",
    applicationLink: "https://example.com/apply/frontend-dev",
  },
];

export const useJobStore = create(
  persist(
    (set, get) => ({
      jobs: [],
      loading: false,
      error: null,

      // Initialize jobs from backend
      initializeJobs: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.get('/jobs');
          set({ jobs: response.data, loading: false });
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch jobs', 
            loading: false 
          });
        }
      },

      // Add new job
      addJob: async (jobData) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/jobs', jobData);
          set((state) => ({
            jobs: [response.data, ...state.jobs],
            loading: false
          }));
          return { success: true, data: response.data };
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to add job', 
            loading: false 
          });
          return { success: false, error: error.response?.data?.message || 'Failed to add job' };
        }
      },

      // Update existing job
      updateJob: async (jobData) => {
        set({ loading: true, error: null });
        try {
          const response = await api.put(`/jobs/${jobData.id}`, jobData);
          set((state) => ({
            jobs: state.jobs.map((job) =>
              job.id === jobData.id ? response.data : job
            ),
            loading: false
          }));
          return { success: true, data: response.data };
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to update job', 
            loading: false 
          });
          return { success: false, error: error.response?.data?.message || 'Failed to update job' };
        }
      },

      // Delete job
      deleteJob: async (jobId) => {
        set({ loading: true, error: null });
        try {
          await api.delete(`/jobs/${jobId}`);
          set((state) => ({
            jobs: state.jobs.filter((job) => job.id !== jobId),
            loading: false
          }));
          return { success: true };
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to delete job', 
            loading: false 
          });
          return { success: false, error: error.response?.data?.message || 'Failed to delete job' };
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'job-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to rehydrate job store", error);
          state.jobs = initialJobsMock;
        } else if (!state || !state.jobs || state.jobs.length === 0) {
          console.log("Rehydrating job store: store empty or invalid, using initial mock data.");
          if (state) {
            state.jobs = initialJobsMock;
          }
        }
      }
    }
  )
);

// Redundant client-side initialization block removed.
