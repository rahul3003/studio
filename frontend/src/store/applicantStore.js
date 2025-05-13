
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const initialApplicants = [
  { id: 'APP001', jobId: 'JOB001', name: 'Chandra Shekhar', email: 'chandra.s@example.com', assertifyScore: 85, offerStatus: 'Pending', resumeLink: '/path/to/resume1.pdf', offeredSalary: null, offeredStartDate: null, offerLetterHtml: null },
  { id: 'APP002', jobId: 'JOB001', name: 'Bhavana Reddy', email: 'bhavana.r@example.com', assertifyScore: 92, offerStatus: 'Selected', resumeLink: '/path/to/resume2.pdf', offeredSalary: null, offeredStartDate: null, offerLetterHtml: null },
  { id: 'APP003', jobId: 'JOB002', name: 'Karthik Rao', email: 'karthik.r@example.com', assertifyScore: 78, offerStatus: 'Pending', resumeLink: '/path/to/resume3.pdf', offeredSalary: null, offeredStartDate: null, offerLetterHtml: null },
  { id: 'APP004', jobId: 'JOB001', name: 'Priya Anand', email: 'priya.a@example.com', assertifyScore: 88, offerStatus: 'Rejected (Application)', resumeLink: '/path/to/resume4.pdf', offeredSalary: null, offeredStartDate: null, offerLetterHtml: null },
  { id: 'APP005', jobId: 'JOB002', name: 'Arjun Verma', email: 'arjun.v@example.com', assertifyScore: 90, offerStatus: 'Offer Generated', resumeLink: '/path/to/resume5.pdf', offeredSalary: '₹12,00,000 per annum', offeredStartDate: '2024-09-01', offerLetterHtml: '<p>Your mock offer letter content for Arjun Verma.</p>' },
  { id: 'APP006', jobId: 'JOB001', name: 'Sneha Gupta', email: 'sneha.g@example.com', assertifyScore: 95, offerStatus: 'Offer Sent', resumeLink: '/path/to/resume6.pdf', offeredSalary: '₹15,00,000 per annum', offeredStartDate: '2024-08-15', offerLetterHtml: '<p>Offer letter for Sneha Gupta.</p>' },
  { id: 'APP007', jobId: 'JOB002', name: 'Ravi Teja', email: 'ravi.t@example.com', assertifyScore: 82, offerStatus: 'Offer Accepted', resumeLink: '/path/to/resume7.pdf', offeredSalary: '₹11,00,000 per annum', offeredStartDate: '2024-09-10', offerLetterHtml: '<p>Offer for Ravi Teja.</p>' },
  { id: 'APP008', jobId: 'JOB001', name: 'Anita Desai', email: 'anita.d@example.com', assertifyScore: 75, offerStatus: 'Hired', resumeLink: '/path/to/resume8.pdf', offeredSalary: '₹14,00,000 per annum', offeredStartDate: '2024-07-01', offerLetterHtml: '<p>Offer for Anita Desai.</p>' },
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
