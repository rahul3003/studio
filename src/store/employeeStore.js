
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { initialEmployees as mockInitialEmployees } from '@/data/initial-employees'; // Import from the new data file

export const useEmployeeStore = create(
  persist(
    (set, get) => ({
      employees: mockInitialEmployees.map(emp => ({
        ...emp,
        employeeType: emp.employeeType || "Full-time", // Default if not present
        joiningLetterHtml: emp.joiningLetterHtml || null, // Default if not present
        salary: emp.salary || "Not Disclosed", // Default salary
      })),
      _initializeEmployees: () => {
        const currentEmployees = get().employees;
        if (!currentEmployees || currentEmployees.length === 0) {
          set({ employees: mockInitialEmployees.map(emp => ({
            ...emp,
            employeeType: emp.employeeType || "Full-time",
            joiningLetterHtml: emp.joiningLetterHtml || null,
            salary: emp.salary || "Not Disclosed",
          })) });
        }
      },
      addEmployee: (employee) =>
        set((state) => ({
          employees: [{ 
            ...employee, 
            employeeType: employee.employeeType || "Full-time",
            joiningLetterHtml: employee.joiningLetterHtml || null,
            salary: employee.salary || "Not Disclosed",
           }, ...state.employees],
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
      setEmployees: (employees) => set({ employees: employees.map(emp => ({
        ...emp,
        employeeType: emp.employeeType || "Full-time",
        joiningLetterHtml: emp.joiningLetterHtml || null,
        salary: emp.salary || "Not Disclosed",
      })) }),
    }),
    {
      name: 'employee-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to rehydrate employee store", error);
          state.employees = mockInitialEmployees.map(emp => ({
            ...emp,
            employeeType: emp.employeeType || "Full-time",
            joiningLetterHtml: emp.joiningLetterHtml || null,
            salary: emp.salary || "Not Disclosed",
          }));
        } else if (!state || !state.employees || state.employees.length === 0) {
          console.log("Rehydrating employee store: store empty or invalid, using initial mock data.");
          if (state) {
            state.employees = mockInitialEmployees.map(emp => ({
              ...emp,
              employeeType: emp.employeeType || "Full-time",
              joiningLetterHtml: emp.joiningLetterHtml || null,
              salary: emp.salary || "Not Disclosed",
            }));
          }
        }
      }
    }
  )
);
