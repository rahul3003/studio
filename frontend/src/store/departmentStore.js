import { create } from 'zustand';
import { departmentService } from '@/services/departmentService';

const store = (set, get) => ({
  departments: [],
  loading: false,
  error: null,

  fetchDepartments: async () => {
    const currentState = get();
    if (currentState.loading) return;
    
    set({ loading: true, error: null });
    try {
      const response = await departmentService.getAllDepartments();
      const departments = Array.isArray(response) ? response : [];
      set({ departments, loading: false, error: null });
      return { success: true, departments };
    } catch (err) {
      console.error('Error fetching departments:', err);
      set({ 
        departments: [], 
        loading: false, 
        error: err.response?.data?.error || 'Failed to fetch departments.' 
      });
      return { success: false, error: err.response?.data?.error || 'Failed to fetch departments.' };
    }
  },

  addDepartment: async (department) => {
    set({ loading: true, error: null });
    try {
      const newDepartment = await departmentService.createDepartment(department);
      set(state => ({
        departments: [newDepartment, ...state.departments],
        loading: false,
        error: null
      }));
      return { success: true, department: newDepartment };
    } catch (err) {
      console.error('Error creating department:', err);
      set({ 
        loading: false, 
        error: err.response?.data?.error || 'Failed to create department.' 
      });
      return { success: false, error: err.response?.data?.error || 'Failed to create department.' };
    }
  },

  updateDepartment: async (updatedDepartment) => {
    set({ loading: true, error: null });
    try {
      const department = await departmentService.updateDepartment(
        updatedDepartment.id,
        updatedDepartment
      );
      set(state => ({
        departments: state.departments.map(dept =>
          dept.id === department.id ? department : dept
        ),
        loading: false,
        error: null
      }));
      return { success: true, department };
    } catch (err) {
      console.error('Error updating department:', err);
      set({ 
        loading: false, 
        error: err.response?.data?.error || 'Failed to update department.' 
      });
      return { success: false, error: err.response?.data?.error || 'Failed to update department.' };
    }
  },

  deleteDepartment: async (departmentId) => {
    set({ loading: true, error: null });
    try {
      await departmentService.deleteDepartment(departmentId);
      set(state => ({
        departments: state.departments.filter(dept => dept.id !== departmentId),
        loading: false,
        error: null
      }));
      return { success: true };
    } catch (err) {
      console.error('Error deleting department:', err);
      set({ 
        loading: false, 
        error: err.response?.data?.error || 'Failed to delete department.' 
      });
      return { success: false, error: err.response?.data?.error || 'Failed to delete department.' };
        }
  },

  clearError: () => set({ error: null }),
  setLoading: (isLoading) => set({ loading: isLoading }),
  reset: () => set({ departments: [], loading: false, error: null }),
});

export const useDepartmentStore = create(store);
