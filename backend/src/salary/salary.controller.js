const salaryService = require('./salary.service');

class SalaryController {
  // Create a new monthly salary record
  async createMonthlySalary(req, res) {
    try {
      const { employeeId } = req.params;
      const salaryData = req.body;

      // Validate required fields
      const requiredFields = ['year', 'month', 'payPeriodStart', 'payPeriodEnd', 'paymentDate', 'basicSalary', 'workingDays', 'paidDays'];
      for (const field of requiredFields) {
        if (!salaryData[field]) {
          return res.status(400).json({
            success: false,
            message: `${field} is required`
          });
        }
      }

      const monthlySalary = await salaryService.createMonthlySalary(employeeId, salaryData);

      res.status(201).json({
        success: true,
        message: 'Monthly salary created successfully',
        data: monthlySalary
      });
    } catch (error) {
      console.error('Error creating monthly salary:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create monthly salary'
      });
    }
  }

  // Get monthly salary by ID
  async getMonthlySalaryById(req, res) {
    try {
      const { id } = req.params;

      const monthlySalary = await salaryService.getMonthlySalaryById(id);

      res.status(200).json({
        success: true,
        data: monthlySalary
      });
    } catch (error) {
      console.error('Error getting monthly salary:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Monthly salary not found'
      });
    }
  }

  // Get monthly salary by employee and month
  async getMonthlySalaryByEmployeeAndMonth(req, res) {
    try {
      const { employeeId, year, month } = req.params;

      const monthlySalary = await salaryService.getMonthlySalaryByEmployeeAndMonth(
        employeeId,
        parseInt(year),
        parseInt(month)
      );

      res.status(200).json({
        success: true,
        data: monthlySalary
      });
    } catch (error) {
      console.error('Error getting monthly salary:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Monthly salary not found'
      });
    }
  }

  // Get all monthly salaries for an employee
  async getMonthlySalariesByEmployee(req, res) {
    try {
      const { employeeId } = req.params;
      const { year } = req.query;

      const monthlySalaries = await salaryService.getMonthlySalariesByEmployee(
        employeeId,
        year ? parseInt(year) : null
      );

      res.status(200).json({
        success: true,
        data: monthlySalaries
      });
    } catch (error) {
      console.error('Error getting monthly salaries:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get monthly salaries'
      });
    }
  }

  // Get all monthly salaries with filters
  async getAllMonthlySalaries(req, res) {
    try {
      const filters = {
        year: req.query.year ? parseInt(req.query.year) : null,
        month: req.query.month ? parseInt(req.query.month) : null,
        status: req.query.status,
        departmentId: req.query.departmentId,
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 10
      };

      const result = await salaryService.getAllMonthlySalaries(filters);

      res.status(200).json({
        success: true,
        data: result.monthlySalaries,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error getting monthly salaries:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get monthly salaries'
      });
    }
  }

  // Update monthly salary
  async updateMonthlySalary(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const monthlySalary = await salaryService.updateMonthlySalary(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Monthly salary updated successfully',
        data: monthlySalary
      });
    } catch (error) {
      console.error('Error updating monthly salary:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update monthly salary'
      });
    }
  }

  // Approve monthly salary
  async approveMonthlySalary(req, res) {
    try {
      const { id } = req.params;
      const { approvedBy, remarks } = req.body;

      if (!approvedBy) {
        return res.status(400).json({
          success: false,
          message: 'approvedBy is required'
        });
      }

      const monthlySalary = await salaryService.approveMonthlySalary(id, approvedBy, remarks);

      res.status(200).json({
        success: true,
        message: 'Monthly salary approved successfully',
        data: monthlySalary
      });
    } catch (error) {
      console.error('Error approving monthly salary:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to approve monthly salary'
      });
    }
  }

  // Reject monthly salary
  async rejectMonthlySalary(req, res) {
    try {
      const { id } = req.params;
      const { rejectedBy, remarks } = req.body;

      if (!rejectedBy) {
        return res.status(400).json({
          success: false,
          message: 'rejectedBy is required'
        });
      }

      const monthlySalary = await salaryService.rejectMonthlySalary(id, rejectedBy, remarks);

      res.status(200).json({
        success: true,
        message: 'Monthly salary rejected successfully',
        data: monthlySalary
      });
    } catch (error) {
      console.error('Error rejecting monthly salary:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to reject monthly salary'
      });
    }
  }

  // Mark salary as paid
  async markSalaryAsPaid(req, res) {
    try {
      const { id } = req.params;

      const monthlySalary = await salaryService.markSalaryAsPaid(id);

      res.status(200).json({
        success: true,
        message: 'Salary marked as paid successfully',
        data: monthlySalary
      });
    } catch (error) {
      console.error('Error marking salary as paid:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to mark salary as paid'
      });
    }
  }

  // Update payslip URL
  async updatePayslipUrl(req, res) {
    try {
      const { id } = req.params;
      const { payslipUrl } = req.body;

      if (!payslipUrl) {
        return res.status(400).json({
          success: false,
          message: 'payslipUrl is required'
        });
      }

      const monthlySalary = await salaryService.updatePayslipUrl(id, payslipUrl);

      res.status(200).json({
        success: true,
        message: 'Payslip URL updated successfully',
        data: monthlySalary
      });
    } catch (error) {
      console.error('Error updating payslip URL:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update payslip URL'
      });
    }
  }

  // Delete monthly salary
  async deleteMonthlySalary(req, res) {
    try {
      const { id } = req.params;

      const result = await salaryService.deleteMonthlySalary(id);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error deleting monthly salary:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete monthly salary'
      });
    }
  }

  // Get salary statistics
  async getSalaryStatistics(req, res) {
    try {
      const { year, month } = req.query;

      const statistics = await salaryService.getSalaryStatistics(
        year ? parseInt(year) : null,
        month ? parseInt(month) : null
      );

      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error getting salary statistics:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get salary statistics'
      });
    }
  }

  // Create sample salary data
  async createSampleData(req, res) {
    try {
      const sampleData = await salaryService.createSampleData();

      res.status(200).json({
        success: true,
        message: 'Sample salary data created successfully',
        data: sampleData
      });
    } catch (error) {
      console.error('Error creating sample data:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create sample data'
      });
    }
  }
}

module.exports = new SalaryController(); 