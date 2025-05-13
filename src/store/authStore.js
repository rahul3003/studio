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
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        const foundUser = mockUsers.find(u => u.email === email && u.password === password);

        if (foundUser) {
          const baseRole = getRole(foundUser.roleValue);
          if (baseRole) {
            const userData = {
              name: foundUser.name,
              email: foundUser.email,
              currentRole: baseRole, // Current role is initially the base role
              baseRole: baseRole,    // The role user logged in with
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

      setCurrentRole: (newRoleValue) => {
        const currentUser = get().user;
        if (!currentUser || !currentUser.baseRole) {
          console.warn("Cannot switch role: user or baseRole is undefined.");
          return;
        }

        const newRoleObject = getRole(newRoleValue);
        if (!newRoleObject) {
          console.warn(`Cannot switch role: new role value "${newRoleValue}" is invalid.`);
          return;
        }

        const baseRoleValue = currentUser.baseRole.value;
        const allowedSwitchesForBase = ROLE_SWITCH_PERMISSIONS[baseRoleValue] || [];

        // User can always switch back to their base role, or to any role permitted for their base role.
        if (newRoleValue === baseRoleValue || allowedSwitchesForBase.includes(newRoleValue)) {
          set(state => ({
            user: { ...state.user, currentRole: newRoleObject }
          }));
        } else {
          console.warn(`Role switch from ${baseRoleValue} to ${newRoleValue} is not permitted.`);
        }
      },
      
      getAvailableRolesForSwitching: () => {
        const currentUser = get().user;
        if (!currentUser || !currentUser.baseRole) {
          return []; // No user or base role, no roles to switch to
        }

        const baseRoleValue = currentUser.baseRole.value;
        
        // Employees cannot switch roles, only see their own.
        if (baseRoleValue === 'employee') {
            return [currentUser.baseRole]; 
        }

        const allowedSwitchValues = ROLE_SWITCH_PERMISSIONS[baseRoleValue] || [];
        
        // Ensure the base role itself is always an option, plus what's in permissions.
        // This creates a unique list of role values the user can switch to.
        const availableRoleValues = Array.from(new Set([baseRoleValue, ...allowedSwitchValues]));
        
        // Map these values back to the full Role objects from ROLES config.
        return ROLES.filter(role => availableRoleValues.includes(role.value));
      },
      
      setLoading: (isLoading) => set({ loading: isLoading }),

    }),
    {
      name: 'auth-storage', 
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state, error) => { // Changed to the correct signature
        if (error) {
            console.error("Failed to rehydrate auth store", error);
            if (state) { // state might be partially hydrated or null
              state.user = null;
              state.loading = false; // Set loading to false on error
            } else {
              // This ensures initial state is set if rehydration fails completely and state is null
              useAuthStore.setState({ user: null, loading: false, error: "Rehydration failed." });
            }
            return; // Important to return to prevent further processing with potentially corrupted state
        }
        
        if (state) {
          // After successful rehydration, set loading to false.
          // User state is now restored from localStorage (or remains null if not stored).
          state.loading = false; 
        } else {
          // If persist returns null for state (e.g. storage empty), set initial loading to false.
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