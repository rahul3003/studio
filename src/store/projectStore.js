
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
      projects: [],
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
      onRehydrateStorage: () => (state) => {
        if (!state || state.projects.length === 0) {
          console.log("Rehydrating project store with initial mock data.");
          state.projects = initialProjectsMock;
        }
      }
    }
  )
);

if (typeof window !== 'undefined') {
    const storedData = localStorage.getItem('project-storage');
    if (!storedData || JSON.parse(storedData)?.state?.projects?.length === 0) {
      useProjectStore.setState({ projects: initialProjectsMock });
    } else {
      useProjectStore.getState().setProjects(JSON.parse(storedData).state.projects);
    }
}
