const express = require('express');
const router = express.Router();
const controller = require('./job.controller');
const requireAuth = require('../auth/auth.middleware');
const { requireAdminOrSuperadmin } = require('../auth/auth.middleware');

router.get('/jobs', controller.getJobs);
router.get('/jobs/:id', controller.getJobById);
router.post('/jobs', requireAuth, requireAdminOrSuperadmin, controller.createJob);
router.put('/jobs/:id', requireAuth, requireAdminOrSuperadmin, controller.updateJob);
router.delete('/jobs/:id', requireAuth, requireAdminOrSuperadmin, controller.deleteJob);

module.exports = router; 