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

      setCurrentRole: (newRoleValue) => { // Renamed from switchRole for clarity
        const currentUser = get().user;
        if (currentUser && currentUser.baseRole) {
          const newRole = getRole(newRoleValue);
          const allowedSwitchesBasedOnBase = ROLE_SWITCH_PERMISSIONS[currentUser.baseRole.value] || [];
          
          let canSwitch = false;
          if (currentUser.baseRole.value === 'employee') {
            // Employees cannot switch roles.
            canSwitch = newRoleValue === currentUser.baseRole.value;
          } else if (currentUser.baseRole.value === 'superadmin' || currentUser.baseRole.value === 'admin') {
            // Superadmin/Admin can switch to any role in their permission list or back to their base role.
            canSwitch = newRoleValue === currentUser.baseRole.value || allowedSwitchesBasedOnBase.includes(newRoleValue);
          } else { // Manager, HR, Accounts
             // Can switch to 'employee' if allowed, or back to their base role.
             canSwitch = newRoleValue === currentUser.baseRole.value || (newRoleValue === 'employee' && allowedSwitchesBasedOnBase.includes('employee'));
          }

          if (newRole && canSwitch) {
            set(state => ({
              user: { ...state.user, currentRole: newRole }
            }));
          } else {
            console.warn(`Role switch to ${newRoleValue} not allowed for base role ${currentUser.baseRole.value}.`);
          }
        }
      },
      
      getAvailableRolesForSwitching: () => {
        const currentUser = get().user;
         if (!currentUser || !currentUser.baseRole) {
          return [];
        }

        const baseRoleValue = currentUser.baseRole.value;
        if (baseRoleValue === 'employee') {
            return [currentUser.baseRole]; 
        }

        const allowedSwitchValues = ROLE_SWITCH_PERMISSIONS[baseRoleValue] || [];
        
        // Ensure the base role is always an option, plus what's in permissions.
        const availableRoleValues = Array.from(new Set([baseRoleValue, ...allowedSwitchValues]));
        
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
              state.loading = false;
            } else {
              // This ensures initial state is set if rehydration fails completely and state is null
              useAuthStore.setState({ user: null, loading: false, error: "Rehydration failed." });
            }
            return; // Important to return to prevent further processing with potentially corrupted state
        }
        
        if (state) {
          state.loading = false; // Set loading to false after successful rehydration
        } else {
          // If persist returns null for state (e.g. storage empty), set initial loading to false.
           useAuthStore.setState({ user: null, loading: false, error: null });
        }
      }
    }
  )
);
