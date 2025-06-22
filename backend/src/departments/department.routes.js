const express = require('express');
const router = express.Router();
const controller = require('./department.controller');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all departments
router.get('/', controller.getDepartments);

// Create new department
router.post('/', controller.createDepartment);

// Update department
router.put('/:id', controller.updateDepartment);

// Delete department
router.delete('/:id', controller.deleteDepartment);

module.exports = router; 