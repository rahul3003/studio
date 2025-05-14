const express = require('express');
const router = express.Router();
const controller = require('./department.controller');
const requireAuth = require('../auth/auth.middleware');
const { requireAdminOrSuperadmin } = require('../auth/auth.middleware');

router.get('/departments', controller.getDepartments);
router.post('/departments', requireAuth, requireAdminOrSuperadmin, controller.createDepartment);
router.put('/departments/:id', requireAuth, requireAdminOrSuperadmin, controller.updateDepartment);
router.delete('/departments/:id', requireAuth, requireAdminOrSuperadmin, controller.deleteDepartment);

module.exports = router; 