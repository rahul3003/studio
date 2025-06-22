const express = require('express');
const router = express.Router();
const employeeController = require('./employee.controller');
const { authenticateToken } = require('../middleware/auth');

// Basic employee routes
router.get('/', authenticateToken, employeeController.getEmployees);
router.get('/:id', authenticateToken, employeeController.getEmployeeById);
router.post('/', authenticateToken, employeeController.createEmployee);
router.put('/:id', authenticateToken, employeeController.updateEmployee);
router.delete('/:id', authenticateToken, employeeController.deleteEmployee);

// Personal information routes
router.get('/:id/personal', authenticateToken, employeeController.getPersonalInfo);
router.post('/:id/personal', authenticateToken, employeeController.updatePersonalInfo);

// Profile upload route
router.post('/:id/profile', authenticateToken, employeeController.uploadProfile);

// Bank details routes
router.get('/:id/bank', authenticateToken, employeeController.getBankDetails);
router.post('/:id/bank', authenticateToken, employeeController.updateBankDetails);

// Document routes
router.get('/:id/documents', authenticateToken, employeeController.getDocuments);
router.post('/:id/documents', authenticateToken, employeeController.uploadDocument);
router.put('/:id/documents/:documentId', authenticateToken, employeeController.updateDocument);
router.delete('/:id/documents/:documentId', authenticateToken, employeeController.deleteDocument);
router.put('/:id/documents/:documentId/status', authenticateToken, employeeController.updateDocumentStatus);

// Secondary data routes
router.get('/:id/secondary', authenticateToken, employeeController.getSecondaryData);
router.post('/:id/secondary', authenticateToken, employeeController.updateSecondaryData);

module.exports = router;
