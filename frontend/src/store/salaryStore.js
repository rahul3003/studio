import { create } from 'zustand';
import { salaryService } from '@/services/salaryService';

const useSalaryStore = create((set, get) => ({
  // State
  monthlySalaries: [],
  currentSalary: null,
  statistics: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch all monthly salaries
  fetchMonthlySalaries: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await salaryService.getAllMonthlySalaries(filters);
      
      if (response.success) {
        set({
          monthlySalaries: response.data || [], // Ensure we always have an array
          pagination: response.pagination || get().pagination
        });
      } else {
        set({ 
          monthlySalaries: [], // Set empty array on error
          error: response.message || 'Failed to fetch monthly salaries' 
        });
      }
    } catch (error) {
      set({ 
        monthlySalaries: [], // Set empty array on error
        error: error.message 
      });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch monthly salary by ID
  fetchMonthlySalaryById: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await salaryService.getMonthlySalaryById(id);
      
      if (response.success) {
        set({ currentSalary: response.data });
      } else {
        set({ error: response.message || 'Failed to fetch monthly salary' });
      }
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch monthly salary by employee and month
  fetchMonthlySalaryByEmployeeAndMonth: async (employeeId, year, month) => {
    try {
      set({ loading: true, error: null });
      const response = await salaryService.getMonthlySalaryByEmployeeAndMonth(employeeId, year, month);
      
      if (response.success) {
        set({ currentSalary: response.data });
      } else {
        set({ error: response.message || 'Failed to fetch monthly salary' });
      }
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch monthly salaries by employee
  fetchMonthlySalariesByEmployee: async (employeeId, year = null) => {
    try {
      set({ loading: true, error: null });
      const response = await salaryService.getMonthlySalariesByEmployee(employeeId, year);
      
      if (response.success) {
        set({ monthlySalaries: response.data });
      } else {
        set({ error: response.message || 'Failed to fetch employee salaries' });
      }
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Create monthly salary
  createMonthlySalary: async (employeeId, salaryData) => {
    try {
      set({ loading: true, error: null });
      const response = await salaryService.createMonthlySalary(employeeId, salaryData);
      
      if (response.success) {
        // Add the new salary to the list
        set(state => ({
          monthlySalaries: [response.data, ...state.monthlySalaries]
        }));
        return response.data;
      } else {
        set({ error: response.message || 'Failed to create monthly salary' });
        return null;
      }
    } catch (error) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // Update monthly salary
  updateMonthlySalary: async (id, updateData) => {
    try {
      set({ loading: true, error: null });
      const response = await salaryService.updateMonthlySalary(id, updateData);
      
      if (response.success) {
        // Update the salary in the list
        set(state => ({
          monthlySalaries: state.monthlySalaries.map(salary =>
            salary.id === id ? response.data : salary
          ),
          currentSalary: state.currentSalary?.id === id ? response.data : state.currentSalary
        }));
        return response.data;
      } else {
        set({ error: response.message || 'Failed to update monthly salary' });
        return null;
      }
    } catch (error) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // Approve monthly salary
  approveMonthlySalary: async (id, approvedBy, remarks = null) => {
    try {
      set({ loading: true, error: null });
      const response = await salaryService.approveMonthlySalary(id, approvedBy, remarks);
      
      if (response.success) {
        // Update the salary status in the list
        set(state => ({
          monthlySalaries: state.monthlySalaries.map(salary =>
            salary.id === id ? response.data : salary
          ),
          currentSalary: state.currentSalary?.id === id ? response.data : state.currentSalary
        }));
        return response.data;
      } else {
        set({ error: response.message || 'Failed to approve monthly salary' });
        return null;
      }
    } catch (error) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // Mark salary as paid
  markSalaryAsPaid: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await salaryService.markSalaryAsPaid(id);
      
      if (response.success) {
        // Update the salary status in the list
        set(state => ({
          monthlySalaries: state.monthlySalaries.map(salary =>
            salary.id === id ? response.data : salary
          ),
          currentSalary: state.currentSalary?.id === id ? response.data : state.currentSalary
        }));
        return response.data;
      } else {
        set({ error: response.message || 'Failed to mark salary as paid' });
        return null;
      }
    } catch (error) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // Update payslip URL
  updatePayslipUrl: async (id, payslipUrl) => {
    try {
      set({ loading: true, error: null });
      const response = await salaryService.updatePayslipUrl(id, payslipUrl);
      
      if (response.success) {
        // Update the salary in the list
        set(state => ({
          monthlySalaries: state.monthlySalaries.map(salary =>
            salary.id === id ? response.data : salary
          ),
          currentSalary: state.currentSalary?.id === id ? response.data : state.currentSalary
        }));
        return response.data;
      } else {
        set({ error: response.message || 'Failed to update payslip URL' });
        return null;
      }
    } catch (error) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // Delete monthly salary
  deleteMonthlySalary: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await salaryService.deleteMonthlySalary(id);
      
      if (response.success) {
        // Remove the salary from the list
        set(state => ({
          monthlySalaries: state.monthlySalaries.filter(salary => salary.id !== id),
          currentSalary: state.currentSalary?.id === id ? null : state.currentSalary
        }));
        return true;
      } else {
        set({ error: response.message || 'Failed to delete monthly salary' });
        return false;
      }
    } catch (error) {
      set({ error: error.message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Fetch salary statistics (alias for fetchSalaryStatistics)
  fetchStatistics: async (year = null, month = null) => {
    try {
      set({ loading: true, error: null });
      const response = await salaryService.getSalaryStatistics(year, month);
      
      if (response.success) {
        set({ statistics: response.data || {} });
      } else {
        set({ 
          statistics: {
            totalSalaries: 0,
            totalPayroll: 0,
            averageSalary: 0,
            pendingApprovals: 0,
            approvedCount: 0,
            paidCount: 0,
            rejectedCount: 0,
            totalEmployees: 0,
            departmentStats: [],
            monthlyTrends: []
          },
          error: response.message || 'Failed to fetch salary statistics' 
        });
      }
    } catch (error) {
      set({ 
        statistics: {
          totalSalaries: 0,
          totalPayroll: 0,
          averageSalary: 0,
          pendingApprovals: 0,
          approvedCount: 0,
          paidCount: 0,
          rejectedCount: 0,
          totalEmployees: 0,
          departmentStats: [],
          monthlyTrends: []
        },
        error: error.message 
      });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch salary statistics (original method)
  fetchSalaryStatistics: async (year = null, month = null) => {
    try {
      set({ loading: true, error: null });
      const response = await salaryService.getSalaryStatistics(year, month);
      
      if (response.success) {
        set({ statistics: response.data });
      } else {
        set({ error: response.message || 'Failed to fetch salary statistics' });
      }
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Approve salary (alias for approveMonthlySalary)
  approveSalary: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await salaryService.approveMonthlySalary(id, 'system', 'Approved via salary management');
      
      if (response.success) {
        // Update the salary status in the list
        set(state => ({
          monthlySalaries: state.monthlySalaries.map(salary =>
            salary.id === id ? response.data : salary
          ),
          currentSalary: state.currentSalary?.id === id ? response.data : state.currentSalary
        }));
        return response.data;
      } else {
        set({ error: response.message || 'Failed to approve salary' });
        return null;
      }
    } catch (error) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // Reject salary
  rejectSalary: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await salaryService.rejectMonthlySalary(id, 'system', 'Rejected via salary management');
      
      if (response.success) {
        // Update the salary status in the list
        set(state => ({
          monthlySalaries: state.monthlySalaries.map(salary =>
            salary.id === id ? response.data : salary
          ),
          currentSalary: state.currentSalary?.id === id ? response.data : state.currentSalary
        }));
        return response.data;
      } else {
        set({ error: response.message || 'Failed to reject salary' });
        return null;
      }
    } catch (error) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // Create sample data
  createSampleData: async () => {
    try {
      set({ loading: true, error: null });
      const response = await salaryService.createSampleData();
      
      if (response.success) {
        // Refresh the data after creating sample data
        await get().fetchMonthlySalaries();
        await get().fetchStatistics();
        return response.data;
      } else {
        set({ error: response.message || 'Failed to create sample data' });
        return null;
      }
    } catch (error) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // Clear current salary
  clearCurrentSalary: () => set({ currentSalary: null }),

  // Reset store
  reset: () => set({
    monthlySalaries: [],
    currentSalary: null,
    statistics: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    }
  })
}));

export default useSalaryStore; 