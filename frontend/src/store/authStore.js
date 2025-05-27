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

      // Helper to get current user with proper structure
      getCurrentUser: () => {
        const { user } = get();
        console.log("getCurrentUser - Current user state:", user);
        if (!user) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          // Add any additional fields needed for the application
          department: user.department || 'ASSERT', // Default to ASSERT if not provided
          bankName: user.bankName || 'HDFC Bank', // Default values for development
          accountNo: user.accountNo || '0157116003189',
          staffCode: user.staffCode || user.id.slice(0, 8) // Use first 8 chars of ID if no staff code
        };
      },

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { data } = res.data;
          console.log("Login response data:", data);
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('jwt', data.token);
          }
          
          // Always store roles as uppercase for consistency
          const initialRole = (data.role || '').toUpperCase();
          const userData = {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            token: data.token
          };
          console.log("Setting user data:", userData);
          
          set({ 
            user: userData,
            currentRole: initialRole,
            baseRole: initialRole,
            loading: false, 
            error: null 
          });
          return { success: true, user: userData };
        } catch (err) {
          console.error("Login error:", err);
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
            user: {
              id: data.id,
              name: data.name,
              email: data.email,
              role: data.role,
              token: data.token
            }, 
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
        return ROLE_SWITCH_PERMISSIONS[baseRole]?.map(r => r.toUpperCase()) || [];
      },

      getCurrentRoleConfig: () => {
        const { currentRole } = get();
        if (!currentRole) return null;
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
        console.log("Rehydrating auth store. State:", state, "Error:", error);
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
          console.log("Rehydrated state:", state);
          state.loading = false; 
        } else {
          console.log("No state to rehydrate, setting defaults");
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

// Initialize the store with the token from localStorage if it exists
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('jwt');
  if (token) {
    // You might want to validate the token here or fetch user data
    console.log("Found token in localStorage:", token);
  }
}