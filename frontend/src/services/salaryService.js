import api from './api';

export const salaryService = {
  // Get all monthly salaries with filters
  async getAllMonthlySalaries(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.year) params.append('year', filters.year);
      if (filters.month) params.append('month', filters.month);
      if (filters.status) params.append('status', filters.status);
      if (filters.departmentId) params.append('departmentId', filters.departmentId);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/salaries/monthly-salaries?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch monthly salaries');
    }
  },

  // Get monthly salary by ID
  async getMonthlySalaryById(id) {
    try {
      const response = await api.get(`/salaries/monthly-salaries/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch monthly salary');
    }
  },

  // Get monthly salary by employee and month
  async getMonthlySalaryByEmployeeAndMonth(employeeId, year, month) {
    try {
      const response = await api.get(`/salaries/employees/${employeeId}/monthly-salaries/${year}/${month}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch monthly salary');
    }
  },

  // Get all monthly salaries for an employee
  async getMonthlySalariesByEmployee(employeeId, year = null) {
    try {
      const params = year ? `?year=${year}` : '';
      const response = await api.get(`/salaries/employees/${employeeId}/monthly-salaries${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch employee salaries');
    }
  },

  // Create a new monthly salary record
  async createMonthlySalary(employeeId, salaryData) {
    try {
      const response = await api.post(`/salaries/employees/${employeeId}/monthly-salaries`, salaryData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create monthly salary');
    }
  },

  // Update monthly salary
  async updateMonthlySalary(id, updateData) {
    try {
      const response = await api.put(`/salaries/monthly-salaries/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update monthly salary');
    }
  },

  // Approve monthly salary
  async approveMonthlySalary(id, approvedBy, remarks = null) {
    try {
      const response = await api.patch(`/salaries/monthly-salaries/${id}/approve`, {
        approvedBy,
        remarks
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to approve monthly salary');
    }
  },

  // Reject monthly salary
  async rejectMonthlySalary(id, rejectedBy, remarks = null) {
    try {
      const response = await api.patch(`/salaries/monthly-salaries/${id}/reject`, {
        rejectedBy,
        remarks
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reject monthly salary');
    }
  },

  // Mark salary as paid
  async markSalaryAsPaid(id) {
    try {
      const response = await api.patch(`/salaries/monthly-salaries/${id}/mark-paid`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark salary as paid');
    }
  },

  // Update payslip URL
  async updatePayslipUrl(id, payslipUrl) {
    try {
      const response = await api.patch(`/salaries/monthly-salaries/${id}/payslip`, {
        payslipUrl
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update payslip URL');
    }
  },

  // Delete monthly salary
  async deleteMonthlySalary(id) {
    try {
      const response = await api.delete(`/salaries/monthly-salaries/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete monthly salary');
    }
  },

  // Get salary statistics
  async getSalaryStatistics(year = null, month = null) {
    try {
      const params = new URLSearchParams();
      if (year) params.append('year', year);
      if (month) params.append('month', month);

      const response = await api.get(`/salaries/monthly-salaries/statistics?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch salary statistics');
    }
  },

  // Create sample data
  async createSampleData() {
    try {
      const response = await api.post('/salaries/monthly-salaries/sample-data');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create sample data');
    }
  }
}; 