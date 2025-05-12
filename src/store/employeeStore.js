
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { initialEmployees as mockInitialEmployees } from '@/app/dashboard/employees/page'; // Adjusted path

export const useEmployeeStore = create(
  persist(
    (set, get) => ({
      employees: mockInitialEmployees, // Initialize with mock data directly
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
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to rehydrate employee store", error);
          state.employees = mockInitialEmployees;
        } else if (!state || !state.employees || state.employees.length === 0) {
          console.log("Rehydrating employee store: store empty or invalid, using initial mock data.");
          if (state) {
            state.employees = mockInitialEmployees;
          }
        }
      }
    }
  )
);

// Redundant client-side initialization block removed.
