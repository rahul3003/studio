
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Assuming initialDepartments is defined in the departments page, import it
// For simplicity, I'll define a small mock here. Replace with actual import.
const initialDepartmentsMock = [
  {
    id: "DEPT001",
    name: "Technology",
    head: "Dr. Emily Carter",
    description: "Responsible for software development and IT infrastructure.",
    creationDate: "2022-01-15",
  },
  {
    id: "DEPT002",
    name: "Human Resources",
    head: "Michael Chen",
    description: "Manages employee relations, recruitment, and benefits.",
    creationDate: "2021-03-20",
  },
];


export const useDepartmentStore = create(
  persist(
    (set, get) => ({
      departments: initialDepartmentsMock, // Initialize with mock data directly
      _initializeDepartments: () => {
        // This can be called by components if needed, but persist should handle initial load.
        if (get().departments.length === 0) {
          set({ departments: initialDepartmentsMock });
        }
      },
      addDepartment: (department) =>
        set((state) => ({
          departments: [department, ...state.departments],
        })),
      updateDepartment: (updatedDepartment) =>
        set((state) => ({
          departments: state.departments.map((dept) =>
            dept.id === updatedDepartment.id ? { ...dept, ...updatedDepartment } : dept
          ),
        })),
      deleteDepartment: (departmentId) =>
        set((state) => ({
          departments: state.departments.filter((dept) => dept.id !== departmentId),
        })),
      setDepartments: (departments) => set({ departments }),
    }),
    {
      name: 'department-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to rehydrate department store", error);
          // Set to initial mock data on error
          state.departments = initialDepartmentsMock;
        } else if (!state || !state.departments || state.departments.length === 0) {
          console.log("Rehydrating department store: store empty or invalid, using initial mock data.");
          // If state is undefined, null, or departments array is empty, set to mock data.
          // This ensures that if localStorage is empty or data is corrupted, we fall back to mocks.
          if (state) { // if state exists but departments is empty/invalid
            state.departments = initialDepartmentsMock;
          } else { // if state itself is null/undefined (e.g. first load, error parsing)
            // Zustand's persist middleware might pass null for state if rehydration fails.
            // In such cases, we need to return an object to set the initial state.
            // However, the `set` function is not directly available here.
            // The best practice is to ensure the initial state in `create` is what you want on first load.
            // The `initialDepartmentsMock` in `create` handles the very first load.
            // This `onRehydrateStorage` then handles cases where localStorage is empty or cleared.
            // If `state` is null, it means rehydration provided nothing or an error occurred that persist handled by giving null.
            // We can't directly `set` here, but we can modify the `state` object if it's passed.
            // If `state` is `null`, this won't run. If it's an object, we modify it.
            // To be absolutely sure, the initial state provided to `create` should be the default.
          }
        }
      }
    }
  )
);

// The redundant client-side initialization block has been removed.
// `persist` and `onRehydrateStorage` (along with the initial state in `create`)
// are responsible for initializing the store.
// Component-level `useEffect` calling `_initializeDepartments` can remain as a safeguard if needed.
