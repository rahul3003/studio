const express = require('express');
const router = express.Router();
const controller = require('./applicant.controller');
const requireAuth = require('../auth/auth.middleware');
const { requireAdminOrSuperadmin } = require('../auth/auth.middleware');

router.get('/applicants', controller.getApplicants);
router.get('/applicants/:id', controller.getApplicantById);
router.post('/applicants', requireAuth, requireAdminOrSuperadmin, controller.createApplicant);
router.put('/applicants/:id', requireAuth, requireAdminOrSuperadmin, controller.updateApplicant);
router.delete('/applicants/:id', requireAuth, requireAdminOrSuperadmin, controller.deleteApplicant);

module.exports = router;
