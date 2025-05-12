
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { initialEmployees as mockInitialEmployees } from '@/app/dashboard/employees/page'; // Adjusted path

export const useEmployeeStore = create(
  persist(
    (set, get) => ({
      employees: [], // Initialize with empty array, persist will load or use mock
      // Initialize with mock data if storage is empty
      _initializeEmployees: () => {
        if (get().employees.length === 0) {
          set({ employees: mockInitialEmployees });
        }
      },
      addEmployee: (employee) =>
        set((state) => ({
          employees: [employee, ...state.employees],
        })),
      updateEmployee: (updatedEmployee) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === updatedEmployee.id ? { ...emp, ...updatedEmployee } : emp
          ),
        })),
      deleteEmployee: (employeeId) =>
        set((state) => ({
          employees: state.employees.filter((emp) => emp.id !== employeeId),
        })),
      setEmployees: (employees) => set({ employees }),
    }),
    {
      name: 'employee-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
         // Ensure initial data is loaded if store was empty
        if (!state || state.employees.length === 0) {
          console.log("Rehydrating employee store with initial mock data.");
          state.employees = mockInitialEmployees;
        }
      }
    }
  )
);

// Call initialization logic after store creation
// This ensures that if localStorage is empty, it gets populated with mock data.
// This needs to run on the client side.
if (typeof window !== 'undefined') {
    const storedEmployees = localStorage.getItem('employee-storage');
    if (!storedEmployees || JSON.parse(storedEmployees)?.state?.employees?.length === 0) {
      useEmployeeStore.setState({ employees: mockInitialEmployees });
    } else {
      // If there's data, ensure the store is synced (persist should handle this, but explicit sync can be added)
      useEmployeeStore.getState().setEmployees(JSON.parse(storedEmployees).state.employees);
    }
}
