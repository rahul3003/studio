
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const initialApplicants = [
  { id: 'APP001', jobId: 'JOB001', name: 'Chandra Shekhar', email: 'chandra.s@example.com', assertifyScore: 85, offerStatus: 'Pending', resumeLink: '/path/to/resume1.pdf', offeredSalary: null, offeredStartDate: null, offerLetterHtml: null },
  { id: 'APP002', jobId: 'JOB001', name: 'Bhavana Reddy', email: 'bhavana.r@example.com', assertifyScore: 92, offerStatus: 'Pending', resumeLink: '/path/to/resume2.pdf', offeredSalary: null, offeredStartDate: null, offerLetterHtml: null },
  { id: 'APP003', jobId: 'JOB002', name: 'Karthik Rao', email: 'karthik.r@example.com', assertifyScore: 78, offerStatus: 'Pending', resumeLink: '/path/to/resume3.pdf', offeredSalary: null, offeredStartDate: null, offerLetterHtml: null },
  { id: 'APP004', jobId: 'JOB001', name: 'Priya Anand', email: 'priya.a@example.com', assertifyScore: 88, offerStatus: 'Pending', resumeLink: '/path/to/resume4.pdf', offeredSalary: null, offeredStartDate: null, offerLetterHtml: null },
  // Example of an applicant with a generated offer
  { id: 'APP005', jobId: 'JOB002', name: 'Arjun Verma', email: 'arjun.v@example.com', assertifyScore: 90, offerStatus: 'Offer Generated', resumeLink: '/path/to/resume5.pdf', offeredSalary: '₹12,00,000 per annum', offeredStartDate: '2024-09-01', offerLetterHtml: '<p>Your mock offer letter content for Arjun Verma.</p>' },
];

export const useApplicantStore = create(
  persist(
    (set, get) => ({
      applicants: initialApplicants,
      _initializeApplicants: () => {
        const currentApplicants = get().applicants;
        if (!currentApplicants || currentApplicants.length === 0) {
          set({ applicants: initialApplicants });
        }
      },
      getApplicantsByJobId: (jobId) => {
        return get().applicants.filter(app => app.jobId === jobId);
      },
      getApplicantById: (applicantId) => {
        return get().applicants.find(app => app.id === applicantId);
      },
      updateApplicant: (applicantId, updatedData) => {
        set((state) => ({
          applicants: state.applicants.map((app) =>
            app.id === applicantId ? { ...app, ...updatedData } : app
          ),
        }));
      },
      addApplicant: (applicant) => 
        set((state) => ({
          applicants: [...state.applicants, { ...applicant, id: `APP${String(Date.now()).slice(-4)}${String(state.applicants.length + 1).padStart(3, '0')}`, offerStatus: 'Pending' }],
        })),
    }),
    {
      name: 'applicant-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state, error) => {
        if (error) console.error("Failed to rehydrate applicant store", error);
        if (state && (!state.applicants || state.applicants.length === 0)) {
          state.applicants = initialApplicants;
        }
      }
    }
  )
);
