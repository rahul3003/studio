import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { employeeService } from '@/services/employeeService';

const initialState = {
  employees: [],
  loading: false,
  error: null,
};

export const useEmployeeStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // Initialize employees from API
      initializeEmployees: async () => {
        set({ loading: true, error: null });
        try {
          const response = await employeeService.getAllEmployees();
          const employees = Array.isArray(response) ? response : [];
          
          // Transform the data to match our frontend structure
          const transformedEmployees = employees.map(emp => ({
            id: emp.id,
            employeeCode: emp.employeeCode,
            name: emp.name,
            email: emp.email,
            role: emp.role,
            designation: emp.designation,
            departmentId: emp.departmentId,
            department: emp.department?.name,
            employeeType: emp.employeeType,
            gender: emp.gender,
            joinDate: emp.joinDate,
            status: emp.status,
            salary: emp.salary,
            avatarUrl: emp.avatarUrl || `https://i.pravatar.cc/150?u=${emp.email}`,
            reportingManager: emp.reportingManager,
            reportingManagerId: emp.reportingManagerId,
            joiningLetterHtml: emp.joiningLetterHtml,
            baseRole: emp.baseRole,
            currentRole: emp.currentRole,
            passwordHash: emp.passwordHash,
            jwtToken: emp.jwtToken
          }));

          set({ employees: transformedEmployees, loading: false, error: null });
          return { success: true, employees: transformedEmployees };
        } catch (err) {
          set({ 
            employees: [], 
            loading: false, 
            error: err.response?.data?.error || 'Failed to fetch employees.' 
          });
          return { success: false, error: err.response?.data?.error || 'Failed to fetch employees.' };
        }
      },

      // Add new employee
      addEmployee: async (employee) => {
        set({ loading: true, error: null });
        try {
          // Generate employee code if not provided
          if (!employee.employeeCode) {
            const timestamp = Date.now().toString().slice(-4);
            const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            employee.employeeCode = `EMPVL${timestamp}${randomNum}`;
          }

          const newEmployee = await employeeService.createEmployee({
            ...employee, 
            role: employee.role || 'EMPLOYEE',
            baseRole: employee.role || 'EMPLOYEE',
            currentRole: employee.role || 'EMPLOYEE',
            status: employee.status || 'ACTIVE',
            designation: employee.designation || 'INTERN',
            joinDate: employee.joinDate || new Date().toISOString(),
            employeeType: employee.employeeType || 'FULL_TIME',
            gender: employee.gender || 'OTHER'
          });

          const transformedEmployee = {
            id: newEmployee.id,
            employeeCode: newEmployee.employeeCode,
            name: newEmployee.name,
            email: newEmployee.email,
            role: newEmployee.role,
            designation: newEmployee.designation,
            departmentId: newEmployee.departmentId,
            department: newEmployee.department?.name,
            employeeType: newEmployee.employeeType,
            gender: newEmployee.gender,
            joinDate: newEmployee.joinDate,
            status: newEmployee.status,
            salary: newEmployee.salary,
            avatarUrl: newEmployee.avatarUrl || `https://i.pravatar.cc/150?u=${newEmployee.email}`,
            reportingManager: newEmployee.reportingManager,
            reportingManagerId: newEmployee.reportingManagerId,
            joiningLetterHtml: newEmployee.joiningLetterHtml,
            baseRole: newEmployee.baseRole,
            currentRole: newEmployee.currentRole
          };

          set(state => ({
            employees: [transformedEmployee, ...(state.employees || [])],
            loading: false,
            error: null
          }));
          return { success: true, employee: transformedEmployee };
        } catch (err) {
          set({ 
            loading: false, 
            error: err.response?.data?.error || 'Failed to create employee.' 
          });
          return { success: false, error: err.response?.data?.error || 'Failed to create employee.' };
        }
      },

      // Update employee
      updateEmployee: async (updatedEmployee) => {
        set({ loading: true, error: null });
        try {
          const employee = await employeeService.updateEmployee(updatedEmployee.id, {
            ...updatedEmployee,
            role: updatedEmployee.role || 'EMPLOYEE',
            baseRole: updatedEmployee.baseRole || updatedEmployee.role || 'EMPLOYEE',
            currentRole: updatedEmployee.currentRole || updatedEmployee.role || 'EMPLOYEE',
            designation: updatedEmployee.designation || 'INTERN'
          });

          const transformedEmployee = {
            id: employee.id,
            employeeCode: employee.employeeCode,
            name: employee.name,
            email: employee.email,
            role: employee.role,
            designation: employee.designation,
            departmentId: employee.departmentId,
            department: employee.department?.name,
            employeeType: employee.employeeType,
            gender: employee.gender,
            joinDate: employee.joinDate,
            status: employee.status,
            salary: employee.salary,
            avatarUrl: employee.avatarUrl || `https://i.pravatar.cc/150?u=${employee.email}`,
            reportingManager: employee.reportingManager,
            reportingManagerId: employee.reportingManagerId,
            joiningLetterHtml: employee.joiningLetterHtml,
            baseRole: employee.baseRole,
            currentRole: employee.currentRole
          };

          set(state => ({
            employees: (state.employees || []).map(emp =>
              emp.id === transformedEmployee.id ? transformedEmployee : emp
            ),
            loading: false,
            error: null
          }));
          return { success: true, employee: transformedEmployee };
        } catch (err) {
          set({ 
            loading: false, 
            error: err.response?.data?.error || 'Failed to update employee.' 
          });
          return { success: false, error: err.response?.data?.error || 'Failed to update employee.' };
        }
      },

      // Delete employee
      deleteEmployee: async (employeeId) => {
        set({ loading: true, error: null });
        try {
          await employeeService.deleteEmployee(employeeId);
          set(state => ({
            employees: (state.employees || []).filter(emp => emp.id !== employeeId),
            loading: false,
            error: null
          }));
          return { success: true };
        } catch (err) {
          set({ 
            loading: false, 
            error: err.response?.data?.error || 'Failed to delete employee.' 
          });
          return { success: false, error: err.response?.data?.error || 'Failed to delete employee.' };
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Set loading state
      setLoading: (isLoading) => set({ loading: isLoading }),

      // Reset store to initial state
      reset: () => set(initialState),
    }),
    {
      name: 'employee-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state, error) => {
        if (error) {
          console.error('Failed to rehydrate employee store', error);
          if (state) {
            state.employees = [];
            state.loading = false;
            state.error = 'Rehydration failed.';
          } else {
            useEmployeeStore.setState(initialState);
          }
          return;
        }
        if (state) {
          state.loading = false;
        } else {
          useEmployeeStore.setState(initialState);
        }
      }
    }
  )
);

// Initialize loading to false on first load if not rehydrating
if (typeof window !== 'undefined' && useEmployeeStore.getState().loading) {
  useEmployeeStore.setState({ loading: false });
}