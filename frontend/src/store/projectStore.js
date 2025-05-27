import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import projectService from '@/services/projectService';

const initialState = {
  projects: [],
  loading: false,
  error: null,
  selectedProject: null,
};

export const useProjectStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // Fetch all projects
      fetchProjects: async (filters = {}) => {
        set({ loading: true, error: null });
        try {
          const projects = await projectService.getAll(filters);
          console.log("projects", projects);
          set({ projects: Array.isArray(projects) ? projects : [], loading: false });
        } catch (error) {
          set({ error: error.message, loading: false, projects: [] });
        }
      },

      // Fetch a single project
      fetchProject: async (id) => {
        set({ loading: true, error: null });
        try {
          const project = await projectService.getById(id);
          set({ selectedProject: project, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      // Create a new project
      createProject: async (projectData) => {
        set({ loading: true, error: null });
        try {
          const newProject = await projectService.create(projectData);
          set((state) => ({
            projects: Array.isArray(state.projects) ? [...state.projects, newProject] : [newProject],
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      // Update a project
      updateProject: async (id, projectData) => {
        set({ loading: true, error: null });
        try {
          const updatedProject = await projectService.update(id, projectData);
          set((state) => ({
            projects: Array.isArray(state.projects) 
              ? state.projects.map((p) => p.id === id ? updatedProject : p)
              : [updatedProject],
            selectedProject: updatedProject,
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      // Delete a project
      deleteProject: async (id) => {
        set({ loading: true, error: null });
        try {
          await projectService.delete(id);
          set((state) => ({
            projects: Array.isArray(state.projects) 
              ? state.projects.filter((p) => p.id !== id)
              : [],
            selectedProject: null,
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      // Add team member
      addTeamMember: async (projectId, employeeId) => {
        set({ loading: true, error: null });
        try {
          const updatedProject = await projectService.addTeamMember(projectId, employeeId);
          set((state) => ({
            projects: Array.isArray(state.projects)
              ? state.projects.map((p) => p.id === projectId ? updatedProject : p)
              : [updatedProject],
            selectedProject: updatedProject,
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      // Remove team member
      removeTeamMember: async (projectId, employeeId) => {
        set({ loading: true, error: null });
        try {
          const updatedProject = await projectService.removeTeamMember(projectId, employeeId);
          set((state) => ({
            projects: Array.isArray(state.projects)
              ? state.projects.map((p) => p.id === projectId ? updatedProject : p)
              : [updatedProject],
            selectedProject: updatedProject,
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      // Get team members
      getTeamMembers: async (projectId) => {
        set({ loading: true, error: null });
        try {
          const teamMembers = await projectService.getTeamMembers(projectId);
          set((state) => ({
            selectedProject: state.selectedProject ? {
              ...state.selectedProject,
              teamMembers,
            } : null,
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      // Clear selected project
      clearSelectedProject: () => {
        set({ selectedProject: null });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Reset store to initial state
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'project-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projects: state.projects || [],
        selectedProject: state.selectedProject,
      }),
    }
  )
);
