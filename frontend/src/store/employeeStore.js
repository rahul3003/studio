import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { initialEmployees as mockInitialEmployees } from '@/data/initial-employees'; // Import from the new data file

export const useEmployeeStore = create(
  persist(
    (set, get) => ({
      employees: mockInitialEmployees.map(emp => ({
        ...emp,
        employeeType: emp.employeeType || "Full-time", 
        joiningLetterHtml: emp.joiningLetterHtml || null, 
        salary: emp.salary || "Not Disclosed", 
        reportingManager: emp.reportingManager || null, // Add reportingManager
      })),
      _initializeEmployees: () => {
        const currentEmployees = get().employees;
        if (!currentEmployees || currentEmployees.length === 0) {
          set({ employees: mockInitialEmployees.map(emp => ({
            ...emp,
            employeeType: emp.employeeType || "Full-time",
            joiningLetterHtml: emp.joiningLetterHtml || null,
            salary: emp.salary || "Not Disclosed",
            reportingManager: emp.reportingManager || null, // Add reportingManager
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
            reportingManager: employee.reportingManager || null, // Add reportingManager
           }, ...state.employees],
        })),
      updateEmployee: (updatedEmployee) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === updatedEmployee.id ? { ...emp, ...updatedEmployee, reportingManager: updatedEmployee.reportingManager || emp.reportingManager } : emp // ensure reportingManager is updated
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
        reportingManager: emp.reportingManager || null, // Add reportingManager
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
            reportingManager: emp.reportingManager || null, // Add reportingManager
          }));
        } else if (!state || !state.employees || state.employees.length === 0) {
          console.log("Rehydrating employee store: store empty or invalid, using initial mock data.");
          if (state) {
            state.employees = mockInitialEmployees.map(emp => ({
              ...emp,
              employeeType: emp.employeeType || "Full-time",
              joiningLetterHtml: emp.joiningLetterHtml || null,
              salary: emp.salary || "Not Disclosed",
              reportingManager: emp.reportingManager || null, // Add reportingManager
            }));
          }
        }
      }
    }
  )
);