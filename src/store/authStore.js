
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
          
          // An admin can switch to any role defined in their permissions.
          // Non-admin roles can switch to 'employee' or back to their baseRole if they are currently acting as 'employee'.
          let canSwitch = false;
          if (currentUser.baseRole.value === 'superadmin' || currentUser.baseRole.value === 'admin') {
            canSwitch = newRoleValue === currentUser.baseRole.value || allowedSwitches.includes(newRoleValue);
          } else { // manager, hr, accounts
             canSwitch = newRoleValue === currentUser.baseRole.value || (newRoleValue === 'employee' && allowedSwitches.includes('employee'));
          }


          if (newRole && canSwitch) {
            set(state => ({
              user: { ...state.user, currentRole: newRole }
            }));
          } else {
            console.warn(`Role switch to ${newRoleValue} not allowed for base role ${currentUser.baseRole.value} or current role ${currentUser.currentRole.value}`);
          }
        }
      },
      
      getAvailableRolesForSwitching: () => {
        const currentUser = get().user;
         if (!currentUser || !currentUser.baseRole) {
          return [];
        }
        // Employee role cannot switch to other roles.
        if (currentUser.baseRole.value === 'employee') {
            return [currentUser.baseRole]; 
        }

        const baseRoleValue = currentUser.baseRole.value;
        const allowedSwitchValues = ROLE_SWITCH_PERMISSIONS[baseRoleValue] || [];
        
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
            if (state) {
              state.user = null;
              state.loading = false; // Ensure loading is false even on error
            } else {
              // This case should be rare, but if state is null, set initial state
              useAuthStore.setState({ user: null, loading: false, error: "Rehydration failed critically." });
            }
            return;
        }
        
        if (state) {
          // If rehydration is successful or if state was already there (e.g. persisted state exists)
          state.loading = false;
        } else {
          // If state is null (e.g., storage was empty and persist middleware returned null for state)
          // Set initial state with loading false.
          useAuthStore.setState({ user: null, loading: false, error: null });
        }
      }
    }
  )
);

// Initialize loading state correctly after store setup, especially for client-side.
// This handles the very first load scenario before rehydration completes.
if (typeof window !== 'undefined') {
    const unsub = useAuthStore.persist.onFinishRehydration(() => {
        useAuthStore.setState({ loading: false });
        unsub(); // Unsubscribe after first rehydration
    });

    // Fallback if onFinishRehydration doesn't fire quickly or store is already hydrated
    // (e.g. from a quick refresh with existing localStorage)
    // Check if it's already hydrated, if so, set loading to false.
    if(useAuthStore.persist.hasHydrated()){
        useAuthStore.setState({loading: false});
    }
}
