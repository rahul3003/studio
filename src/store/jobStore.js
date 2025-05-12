
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
      _initializeJobs: () => {
        if (get().jobs.length === 0) {
          set({ jobs: initialJobsMock });
        }
      },
      addJob: (job) =>
        set((state) => ({
          jobs: [job, ...state.jobs],
        })),
      updateJob: (updatedJob) =>
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === updatedJob.id ? { ...job, ...updatedJob } : job
          ),
        })),
      deleteJob: (jobId) =>
        set((state) => ({
          jobs: state.jobs.filter((job) => job.id !== jobId),
        })),
      setJobs: (jobs) => set({ jobs }),
    }),
    {
      name: 'job-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (!state || state.jobs.length === 0) {
          console.log("Rehydrating job store with initial mock data.");
          state.jobs = initialJobsMock;
        }
      }
    }
  )
);

if (typeof window !== 'undefined') {
    const storedData = localStorage.getItem('job-storage');
    if (!storedData || JSON.parse(storedData)?.state?.jobs?.length === 0) {
      useJobStore.setState({ jobs: initialJobsMock });
    } else {
       useJobStore.getState().setJobs(JSON.parse(storedData).state.jobs);
    }
}
