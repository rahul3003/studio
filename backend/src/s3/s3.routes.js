const express = require('express');
const router = express.Router();
const controller = require('./s3.controller');
const requireAuth = require('../auth/auth.middleware');
const { requireAdminOrSuperadmin } = require('../auth/auth.middleware');

// S3 routes
router.post('/upload', requireAuth, requireAdminOrSuperadmin, controller.uploadFile);
router.post('/presigned-url', requireAuth, requireAdminOrSuperadmin, controller.getPresignedUrl);

module.exports = router; 