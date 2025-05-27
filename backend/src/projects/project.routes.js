const express = require('express');
const router = express.Router();
const controller = require('./project.controller');
const requireAuth = require('../auth/auth.middleware');

// Apply authentication middleware to all routes
router.use(requireAuth);

// Create a new project
router.post('/projects', controller.createProject);

// Get all projects with optional filters
router.get('/projects', controller.getProjects);

// Get a specific project by ID
router.get('/projects/:id', controller.getProjectById);

// Update a project
router.put('/projects/:id', controller.updateProject);

// Delete a project
router.delete('/projects/:id', controller.deleteProject);

// Team member management routes
router.post('/projects/:projectId/members', controller.addTeamMember);
router.delete('/projects/:projectId/members', controller.removeTeamMember);
router.get('/projects/:projectId/members', controller.getTeamMembers);

module.exports = router; 