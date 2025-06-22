const express = require('express');
const router = express.Router();
const salaryController = require('./salary.controller');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get salary statistics (MUST come before /:id routes)
router.get('/monthly-salaries/statistics', salaryController.getSalaryStatistics);

// Create sample data (MUST come before /:id routes)
router.post('/monthly-salaries/sample-data', salaryController.createSampleData);

// Get all monthly salaries with filters (MUST come before /:id routes)
router.get('/monthly-salaries', salaryController.getAllMonthlySalaries);

// Create a new monthly salary record for an employee
router.post('/employees/:employeeId/monthly-salaries', salaryController.createMonthlySalary);

// Get monthly salary by employee and month
router.get('/employees/:employeeId/monthly-salaries/:year/:month', salaryController.getMonthlySalaryByEmployeeAndMonth);

// Get all monthly salaries for an employee
router.get('/employees/:employeeId/monthly-salaries', salaryController.getMonthlySalariesByEmployee);

// Get monthly salary by ID (MUST come after more specific routes)
router.get('/monthly-salaries/:id', salaryController.getMonthlySalaryById);

// Update monthly salary
router.put('/monthly-salaries/:id', salaryController.updateMonthlySalary);

// Approve monthly salary
router.patch('/monthly-salaries/:id/approve', salaryController.approveMonthlySalary);

// Reject monthly salary
router.patch('/monthly-salaries/:id/reject', salaryController.rejectMonthlySalary);

// Mark salary as paid
router.patch('/monthly-salaries/:id/mark-paid', salaryController.markSalaryAsPaid);

// Update payslip URL
router.patch('/monthly-salaries/:id/payslip', salaryController.updatePayslipUrl);

// Delete monthly salary
router.delete('/monthly-salaries/:id', salaryController.deleteMonthlySalary);

module.exports = router; 