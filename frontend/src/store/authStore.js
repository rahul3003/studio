import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { data } = res.data;
          // Store JWT in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('jwt', data.token);
          }
          set({ user: data, loading: false, error: null });
          return { success: true, user: data };
        } catch (err) {
          set({ user: null, loading: false, error: err.response?.data?.error || 'Invalid email or password.' });
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
          set({ user: data, loading: false, error: null });
          return { success: true, user: data };
        } catch (err) {
          set({ user: null, loading: false, error: err.response?.data?.error || 'Registration failed.' });
          return { success: false, error: err.response?.data?.error || 'Registration failed.' };
        }
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('jwt');
        }
        set({ user: null, loading: false, error: null });
      },

      setLoading: (isLoading) => set({ loading: isLoading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state, error) => {
        if (error) {
          console.error('Failed to rehydrate auth store', error);
          if (state) {
            state.user = null;
            state.loading = false;
          } else {
            useAuthStore.setState({ user: null, loading: false, error: 'Rehydration failed.' });
          }
          return;
        }
        if (state) {
          state.loading = false;
        } else {
          useAuthStore.setState({ user: null, loading: false, error: null });
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