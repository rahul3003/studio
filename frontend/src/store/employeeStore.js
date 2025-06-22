import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { employeeService } from '@/services/employeeService';

const initialState = {
  employees: [],
  loading: false,
  error: null,
  personalData: {},
  secondaryData: {},
};

export const useEmployeeStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // Initialize employees from API
      initializeEmployees: async (page = 1, limit = 50) => {
        set({ loading: true, error: null });
        try {
          const response = await employeeService.getAllEmployees(page, limit);
          
          if (!response.success) {
            throw new Error(response.message || 'Failed to fetch employees');
          }

          const employees = Array.isArray(response.data) ? response.data : [];
          
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

          set({ 
            employees: transformedEmployees, 
            loading: false, 
            error: null,
            pagination: response.pagination
          });
          
          return { 
            success: true, 
            employees: transformedEmployees,
            pagination: response.pagination
          };
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch employees.';
          set({ 
            employees: [], 
            loading: false, 
            error: errorMessage,
            pagination: null
          });
          return { 
            success: false, 
            error: errorMessage 
          };
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

      fetchEmployeeById: async (id) => {
        set({ loading: true, error: null });
        try {
          const response = await employeeService.getEmployeeById(id);
          if (!response.success) {
            throw new Error(response.message || 'Employee not found');
          }
          set(state => ({
            employees: [
              ...state.employees.filter(e => e.id !== id),
              response.data
            ],
            loading: false,
            error: null
          }));
          return { success: true, employee: response.data };
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch employee.';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      fetchEmployeePersonal: async (id) => {
        set({ loading: true, error: null });
        try {
          const response = await employeeService.getEmployeePersonal(id);
          set(state => ({
            personalData: { ...(state.personalData || {}), [id]: response.data },
            loading: false,
            error: null
          }));
          return { success: true, personal: response.data };
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch personal info.';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      fetchEmployeeSecondary: async (id) => {
        set({ loading: true, error: null });
        try {
          const response = await employeeService.getEmployeeSecondary(id);
          set(state => ({
            secondaryData: { ...(state.secondaryData || {}), [id]: response.data },
            loading: false,
            error: null
          }));
          return { success: true, secondary: response.data };
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch secondary data.';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Update employee personal data
      updateEmployeePersonal: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const response = await employeeService.updateEmployeePersonal(id, data);
          if (!response.success) {
            throw new Error(response.message || 'Failed to update personal information');
          }
          
          set(state => ({
            personalData: {
              ...state.personalData,
              [id]: response.data
            },
            loading: false,
            error: null
          }));
          
          return { success: true, data: response.data };
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to update personal information';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Update employee secondary data
      updateEmployeeSecondary: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const response = await employeeService.updateEmployeeSecondary(id, data);
          if (!response.success) {
            throw new Error(response.message || 'Failed to update secondary information');
          }
          
          set(state => ({
            secondaryData: {
              ...state.secondaryData,
              [id]: response.data
            },
            loading: false,
            error: null
          }));
          
          return { success: true, data: response.data };
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to update secondary information';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Update document status
      updateDocumentStatus: async (id, documentName, status, url = null, number = null) => {
        set({ loading: true, error: null });
        try {
          const response = await employeeService.updateDocumentStatus(id, documentName, status, url, number);
          if (!response.success) {
            throw new Error(response.message || 'Failed to update document status');
          }
          
          // Update the document in personal data
          set(state => {
            const personalData = state.personalData[id];
            if (!personalData) return state;

            const updatedDocuments = personalData.documents.map(doc => 
              doc.name === documentName ? { ...doc, status, url: url || doc.url, number: number || doc.number } : doc
            );

            return {
              personalData: {
                ...state.personalData,
                [id]: {
                  ...personalData,
                  documents: updatedDocuments
                }
              },
              loading: false,
              error: null
            };
          });
          
          return { success: true, data: response.data };
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to update document status';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Update bank details
      updateBankDetails: async (id, bankDetails) => {
        set({ loading: true, error: null });
        try {
          const response = await employeeService.updateEmployeePersonal(id, {
            bankDetails
          });
          
          if (!response.success) {
            throw new Error(response.message || 'Failed to update bank details');
          }
          
          set(state => ({
            personalData: {
              ...state.personalData,
              [id]: {
                ...state.personalData[id],
                bankDetails: response.data.bankDetails
              }
            },
            loading: false,
            error: null
          }));
          
          return { success: true, data: response.data };
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to update bank details';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Add document
      addDocument: async (id, document) => {
        set({ loading: true, error: null });
        try {
          const response = await employeeService.updateEmployeePersonal(id, {
            documents: [
              ...(get().personalData[id]?.documents || []),
              document
            ]
          });
          
          if (!response.success) {
            throw new Error(response.message || 'Failed to add document');
          }
          
          set(state => ({
            personalData: {
              ...state.personalData,
              [id]: {
                ...state.personalData[id],
                documents: response.data.documents
              }
            },
            loading: false,
            error: null
          }));
          
          return { success: true, data: response.data };
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to add document';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Upload profile picture
      uploadProfile: async (id, file, fileType) => {
        set({ loading: true, error: null });
        try {
          const response = await employeeService.uploadProfile(id, file, fileType);
          if (!response.success) {
            throw new Error(response.message || 'Failed to upload profile picture');
          }
          
          set(state => ({
            employees: state.employees.map(emp => 
              emp.id === id ? { ...emp, avatarUrl: response.data.avatarUrl } : emp
            ),
            loading: false,
            error: null
          }));
          
          return { success: true, data: response.data };
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to upload profile picture';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Get bank details
      getBankDetails: async (id) => {
        set({ loading: true, error: null });
        try {
          const response = await employeeService.getBankDetails(id);
          if (!response.success) {
            throw new Error(response.message || 'Failed to fetch bank details');
          }
          
          set(state => ({
            personalData: {
              ...state.personalData,
              [id]: {
                ...state.personalData[id],
                bankDetails: response.data
              }
            },
            loading: false,
            error: null
          }));
          
          return { success: true, data: response.data };
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch bank details';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Get documents
      getDocuments: async (id) => {
        set({ loading: true, error: null });
        try {
          const response = await employeeService.getDocuments(id);
          if (!response.success) {
            throw new Error(response.message || 'Failed to fetch documents');
          }
          
          set(state => ({
            personalData: {
              ...state.personalData,
              [id]: {
                ...state.personalData[id],
                documents: response.data
              }
            },
            loading: false,
            error: null
          }));
          
          return { success: true, data: response.data };
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch documents';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Upload document
      uploadDocument: async (id, document) => {
        set({ loading: true, error: null });
        try {
          const response = await employeeService.uploadDocument(id, document);
          if (!response.success) {
            throw new Error(response.message || 'Failed to upload document');
          }
          
          set(state => ({
            personalData: {
              ...state.personalData,
              [id]: {
                ...state.personalData[id],
                documents: [...(state.personalData[id]?.documents || []), response.data]
              }
            },
            loading: false,
            error: null
          }));
          
          return { success: true, data: response.data };
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to upload document';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Update document
      updateDocument: async (id, documentId, document) => {
        set({ loading: true, error: null });
        try {
          const response = await employeeService.updateDocument(id, documentId, document);
          if (!response.success) {
            throw new Error(response.message || 'Failed to update document');
          }
          
          set(state => ({
            personalData: {
              ...state.personalData,
              [id]: {
                ...state.personalData[id],
                documents: state.personalData[id]?.documents.map(doc => 
                  doc.id === documentId ? response.data : doc
                )
              }
            },
            loading: false,
            error: null
          }));
          
          return { success: true, data: response.data };
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to update document';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Delete document
      deleteDocument: async (id, documentId) => {
        set({ loading: true, error: null });
        try {
          const response = await employeeService.deleteDocument(id, documentId);
          if (!response.success) {
            throw new Error(response.message || 'Failed to delete document');
          }
          
          set(state => ({
            personalData: {
              ...state.personalData,
              [id]: {
                ...state.personalData[id],
                documents: state.personalData[id]?.documents.filter(doc => doc.id !== documentId)
              }
            },
            loading: false,
            error: null
          }));
          
          return { success: true, data: response.data };
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to delete document';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Update document status
      updateDocumentStatus: async (id, documentId, status, remarks) => {
        set({ loading: true, error: null });
        try {
          const response = await employeeService.updateDocumentStatus(id, documentId, status, remarks);
          if (!response.success) {
            throw new Error(response.message || 'Failed to update document status');
          }
          
          set(state => ({
            personalData: {
              ...state.personalData,
              [id]: {
                ...state.personalData[id],
                documents: state.personalData[id]?.documents.map(doc => 
                  doc.id === documentId ? { ...doc, status, remarks } : doc
                )
              }
            },
            loading: false,
            error: null
          }));
          
          return { success: true, data: response.data };
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to update document status';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      }
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