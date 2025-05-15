const express = require('express');
const router = express.Router();
const controller = require('./department.controller');
const requireAuth = require('../auth/auth.middleware');
const { requireAdminOrSuperadmin } = require('../auth/auth.middleware');

// All routes require authentication
router.use(requireAuth);

// Get all departments (any authenticated user can view)
router.get('/departments', controller.getDepartments);

// Create department (admin/superadmin only)
router.post('/departments', requireAdminOrSuperadmin, controller.createDepartment);

// Update department (admin/superadmin only)
router.put('/departments/:id', requireAdminOrSuperadmin, controller.updateDepartment);

// Delete department (admin/superadmin only)
router.delete('/departments/:id', requireAdminOrSuperadmin, controller.deleteDepartment);

module.exports = router; 