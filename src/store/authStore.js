
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getRole, ROLE_SWITCH_PERMISSIONS, ROLES } from '@/config/roles';

// Mock users - in a real app, this would come from an API
const mockUsers = [
  { email: "superadmin@example.com", password: "password", roleValue: "superadmin", name: "Super Admin User" },
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
      loading: true,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        const foundUser = mockUsers.find(u => u.email === email && u.password === password);

        if (foundUser) {
          const baseRole = getRole(foundUser.roleValue);
          if (baseRole) {
            const userData = {
              name: foundUser.name,
              email: foundUser.email,
              currentRole: baseRole, // Initially, currentRole is the baseRole
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
        if (!currentUser || !currentUser.baseRole || currentUser.baseRole.value === 'employee') {
          return [];
        }
        const baseRoleValue = currentUser.baseRole.value;
        const allowedSwitchValues = ROLE_SWITCH_PERMISSIONS[baseRoleValue] || [];
        const availableRoleValues = Array.from(new Set([baseRoleValue, ...allowedSwitchValues]));
        return ROLES.filter(role => availableRoleValues.includes(role.value));
      },
      
      // To be called on app load to initialize from localStorage
      hydrateAuth: () => {
        // Persistence middleware handles this automatically, but good to have a manual trigger if needed or to set loading state.
        // For this setup, we'll rely on persist middleware.
        set({ loading: false }); // Assuming persist has loaded or there's nothing to load
      },
      setLoading: (isLoading) => set({ loading: isLoading }),

    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // This is called when state is rehydrated from storage
        state.loading = false; 
      }
    }
  )
);

// Call hydrateAuth on initial load (outside of component lifecycle, e.g. in _app.js or a root layout)
// For Next.js 13+ App router, this can be tricky. Persist usually handles it.
// We can also use a useEffect in a top-level client component.
// useAuthStore.getState().hydrateAuth(); // One way, but prefer useEffect for client-side logic

if (typeof window !== 'undefined') {
  useAuthStore.getState().setLoading(false); // Ensure loading is false after initial script eval on client
}
