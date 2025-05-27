const express = require('express');
const router = express.Router();
const controller = require('./reimbursement.controller');
const requireAuth = require('../auth/auth.middleware');
const { requireAdminOrSuperadmin } = require('../auth/auth.middleware');

// All routes require authentication
router.use(requireAuth);

// Get all reimbursements (any authenticated user can view)
router.get('/reimbursements', controller.getReimbursements);

// Create reimbursement (admin/superadmin only)
router.post('/reimbursements',  controller.createReimbursement);

// Get a specific reimbursement by ID (any authenticated user)
router.get('/reimbursements/:id', controller.getReimbursementById);

// Update reimbursement (admin/superadmin only)
router.put('/reimbursements/:id',  controller.updateReimbursement);

// Delete reimbursement (admin/superadmin only)
router.delete('/reimbursements/:id', requireAdminOrSuperadmin, controller.deleteReimbursement);

// Add a comment to a reimbursement (any authenticated user)
router.post('/reimbursements/:id/comments', controller.addComment);

// Add a history entry to a reimbursement (any authenticated user)
router.post('/reimbursements/:id/history', controller.addHistoryEntry);

// Get a presigned URL for file upload (any authenticated user)
router.post('/reimbursements/upload/presigned-url', controller.getPresignedUrl);

module.exports = router; 