import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/services/api';
import { ROLE_SWITCH_PERMISSIONS } from '@/config/roles';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      currentRole: null,
      baseRole: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { data } = res.data;
          if (typeof window !== 'undefined') {
            localStorage.setItem('jwt', data.token);
          }
          // Always store roles as uppercase for consistency
          const initialRole = (data.role || '').toUpperCase();
          set({ 
            user: data, 
            currentRole: initialRole,
            baseRole: initialRole,
            loading: false, 
            error: null 
          });
          return { success: true, user: data };
        } catch (err) {
          set({ 
            user: null, 
            currentRole: null,
            baseRole: null,
            loading: false, 
            error: err.response?.data?.error || 'Invalid email or password.' 
          });
          return { success: false, error: err.response?.data?.error || 'Invalid email or password.' };
        }
      },

      register: async (name, email, password, role) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post('/auth/register', { name, email, password, role });
          const { data } = res.data;
          if (typeof window !== 'undefined') {
            localStorage.setItem('jwt', data.token);
          }
          const initialRole = (data.role || '').toUpperCase();
          set({ 
            user: data, 
            currentRole: initialRole,
            baseRole: initialRole,
            loading: false, 
            error: null 
          });
          return { success: true, user: data };
        } catch (err) {
          set({ 
            user: null, 
            currentRole: null,
            baseRole: null,
            loading: false, 
            error: err.response?.data?.error || 'Registration failed.' 
          });
          return { success: false, error: err.response?.data?.error || 'Registration failed.' };
        }
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('jwt');
        }
        set({ 
          user: null, 
          currentRole: null,
          baseRole: null,
          loading: false, 
          error: null 
        });
      },

      setLoading: (isLoading) => set({ loading: isLoading }),

      setCurrentRole: (newRole) => {
        const { user, baseRole } = get();
        if (!user) return false;
        const availableRoles = get().getAvailableRolesForSwitching();
        if (!availableRoles.includes(newRole)) {
          return false;
        }
        set({ currentRole: newRole });
        return true;
      },
      
      getAvailableRolesForSwitching: () => {
        const { user, baseRole } = get();
        if (!user || !baseRole) return [];
        // Use ROLE_SWITCH_PERMISSIONS for switching logic, always based on baseRole
        return ROLE_SWITCH_PERMISSIONS[baseRole]?.map(r => r.toUpperCase()) || [];
      },

      getCurrentRoleConfig: () => {
        const { currentRole } = get();
        if (!currentRole) return null;
        // Not needed for sidebar, but can be used for label, etc.
        return null;
      },

      resetToBaseRole: () => {
        const { user, baseRole } = get();
        if (!user || !baseRole) return false;
        set({ currentRole: baseRole });
        return true;
      },
    }),
    {
      name: 'auth-storage', 
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state, error) => {
        if (error) {
          console.error('Failed to rehydrate auth store', error);
          if (state) {
              state.user = null;
            state.currentRole = null;
            state.baseRole = null;
            state.loading = false;
            } else {
            useAuthStore.setState({ 
              user: null, 
              currentRole: null,
              baseRole: null,
              loading: false, 
              error: 'Rehydration failed.' 
            });
            }
          return;
        }
        if (state) {
          state.loading = false; 
        } else {
          useAuthStore.setState({ 
            user: null, 
            currentRole: null,
            baseRole: null,
            loading: false, 
            error: null 
          });
        }
      }
    }
  )
);

// Initialize loading to false on first load if not rehydrating.
// This is for the case where persist middleware hasn't run yet (e.g. server-side context or first client render before rehydration).
// Note: The onRehydrateStorage handles setting loading to false *after* rehydration.
// This initial call handles the brief moment *before* rehydration might occur.
if (typeof window !== 'undefined' && useAuthStore.getState().loading) {
   // Check if already rehydrated to avoid race condition.
   // A more robust way is to use persist.onFinishRehydration if available, or rely on onRehydrateStorage.
   // For now, this sets it to false, assuming rehydration will correct if needed.
   // useAuthStore.setState({ loading: false }); // This was causing issues. onRehydrateStorage is better.
}