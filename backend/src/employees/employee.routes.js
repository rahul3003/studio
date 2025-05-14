const express = require('express');
const router = express.Router();
const controller = require('./employee.controller');
const requireAuth = require('../auth/auth.middleware');

// All routes require authentication
router.use(requireAuth);

router.get('/employees', controller.getEmployees);
router.get('/employees/:id', controller.getEmployeeById);
router.post('/employees', controller.createEmployee);
router.put('/employees/:id', controller.updateEmployee);
router.delete('/employees/:id', controller.deleteEmployee);

module.exports = router;
