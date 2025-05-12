
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getRole, ROLE_SWITCH_PERMISSIONS, ROLES } from '@/config/roles';

// Mock users - in a real app, this would come from an API
const mockUsers = [
  { email: "superadmin@example.com", password: "password", roleValue: "superadmin", name: "Super Admin User" },
  { email: "admin@example.com", password: "password", roleValue: "admin", name: "Admin User"},
  { email: "manager@example.com", password: "password", roleValue: "manager", name: "Manager User" },
  { email: "hr@example.com", password: "password", roleValue: "hr", name: "HR User" },
  { email: "accounts@example.com", password: "password", roleValue: "accounts", name: "Accounts User" },
  { email: "employee@example.com", password: "password", roleValue: "employee", name: "Employee User" },
  { email: "alice.manager@example.com", password: "password", roleValue: "manager", name: "Alice Manager" },
  { email: "bob.employee@example.com", password: "password", roleValue: "employee", name: "Bob Employee" },
];

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: true, // Initialize loading to true
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        await new Promise(resolve => setTimeout(resolve, 500));
        const foundUser = mockUsers.find(u => u.email === email && u.password === password);

        if (foundUser) {
          const baseRole = getRole(foundUser.roleValue);
          if (baseRole) {
            const userData = {
              name: foundUser.name,
              email: foundUser.email,
              currentRole: baseRole, 
              baseRole: baseRole,
              avatar: `https://i.pravatar.cc/150?u=${foundUser.email}`
            };
            set({ user: userData, loading: false, error: null });
            return { success: true, user: userData };
          } else {
            set({ user: null, loading: false, error: "Invalid role configuration for user." });
            return { success: false, error: "Invalid role configuration." };
          }
        } else {
          set({ user: null, loading: false, error: "Invalid email or password." });
          return { success: false, error: "Invalid email or password." };
        }
      },

      logout: () => {
        set({ user: null, loading: false, error: null });
      },

      switchRole: (newRoleValue) => {
        const currentUser = get().user;
        if (currentUser && currentUser.baseRole) {
          const newRole = getRole(newRoleValue);
          const allowedSwitches = ROLE_SWITCH_PERMISSIONS[currentUser.baseRole.value] || [];
          const canSwitch = newRoleValue === currentUser.baseRole.value || allowedSwitches.includes(newRoleValue);

          if (newRole && canSwitch) {
            set(state => ({
              user: { ...state.user, currentRole: newRole }
            }));
          } else {
            console.warn(`Role switch to ${newRoleValue} not allowed for base role ${currentUser.baseRole.value}`);
          }
        }
      },
      
      getAvailableRolesForSwitching: () => {
        const currentUser = get().user;
         if (!currentUser || !currentUser.baseRole) {
          return [];
        }
        // Employee role cannot switch.
        if (currentUser.baseRole.value === 'employee') {
            return [currentUser.baseRole]; // Only show their own role
        }

        const baseRoleValue = currentUser.baseRole.value;
        const allowedSwitchValues = ROLE_SWITCH_PERMISSIONS[baseRoleValue] || [];
        
        // Ensure the base role is always an option to switch back to
        const availableRoleValues = Array.from(new Set([baseRoleValue, ...allowedSwitchValues]));
        
        return ROLES.filter(role => availableRoleValues.includes(role.value));
      },
      
      setLoading: (isLoading) => set({ loading: isLoading }),

    }),
    {
      name: 'auth-storage', 
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
            console.error("Failed to rehydrate auth store", error);
            // Potentially clear user or set to a default state if rehydration fails
            state.user = null;
        }
        // Always set loading to false after rehydration attempt, successful or not.
        // The `user` state will either be the rehydrated user or null.
        if (state) { // state might be null if rehydration failed completely
          state.loading = false;
        } else {
          // If state is null, we might need to initialize loading state differently,
          // but `set({ loading: false })` outside might cover this.
          // For safety, ensure loading is false.
          useAuthStore.getState().setLoading(false);
        }
      }
    }
  )
);

// This ensures that on the client-side, after the store is potentially rehydrated,
// the loading state is set to false. This helps prevent the app from getting stuck
// in a loading state if rehydration happens quickly or if there's no stored state.
if (typeof window !== 'undefined') {
  useAuthStore.getState().setLoading(false); 
}
