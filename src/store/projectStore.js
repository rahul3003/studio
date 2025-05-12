
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Assuming initialProjects is defined, for simplicity, define a small mock.
const initialProjectsMock = [
  {
    id: "PROJ001",
    name: "HRMS Portal Development",
    description: "Build a comprehensive Human Resource Management System portal for PESU Venture Labs.",
    projectManager: "Rohan Mehra",
    startDate: "2024-01-10",
    endDate: "2024-12-31",
    status: "In Progress",
    teamMembers: "Priya Sharma, Aisha Khan, Suresh Kumar",
  },
];

export const useProjectStore = create(
  persist(
    (set, get) => ({
      projects: initialProjectsMock, // Initialize with mock data directly
      _initializeProjects: () => {
        if (get().projects.length === 0) {
          set({ projects: initialProjectsMock });
        }
      },
      addProject: (project) =>
        set((state) => ({
          projects: [project, ...state.projects],
        })),
      updateProject: (updatedProject) =>
        set((state) => ({
          projects: state.projects.map((proj) =>
            proj.id === updatedProject.id ? { ...proj, ...updatedProject } : proj
          ),
        })),
      deleteProject: (projectId) =>
        set((state) => ({
          projects: state.projects.filter((proj) => proj.id !== projectId),
        })),
      setProjects: (projects) => set({ projects }),
    }),
    {
      name: 'project-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to rehydrate project store", error);
          state.projects = initialProjectsMock;
        } else if (!state || !state.projects || state.projects.length === 0) {
          console.log("Rehydrating project store: store empty or invalid, using initial mock data.");
          if (state) {
            state.projects = initialProjectsMock;
          }
        }
      }
    }
  )
);

// Redundant client-side initialization block removed.
