const projectService = require('./project.service');

async function createProject(req, res) {
  try {
    const project = await projectService.createProject(req.body);
    res.status(201).json({ message: 'Project created successfully', data: project });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getProjects(req, res) {
  try {
    const filters = {
      projectManagerId: req.query.projectManagerId,
      departmentId: req.query.departmentId,
      status: req.query.status,
    };
    const projects = await projectService.getProjects(filters);
    res.json({ data: projects });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getProjectById(req, res) {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.json({ data: project });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function updateProject(req, res) {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    res.json({ message: 'Project updated successfully', data: project });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deleteProject(req, res) {
  try {
    await projectService.deleteProject(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function addTeamMember(req, res) {
  try {
    const { projectId } = req.params;
    const { employeeId } = req.body;
    
    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }

    const project = await projectService.addTeamMember(projectId, employeeId);
    res.json({ message: 'Team member added successfully', data: project });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function removeTeamMember(req, res) {
  try {
    const { projectId } = req.params;
    const { employeeId } = req.body;
    
    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }

    const project = await projectService.removeTeamMember(projectId, employeeId);
    res.json({ message: 'Team member removed successfully', data: project });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getTeamMembers(req, res) {
  try {
    const { projectId } = req.params;
    const teamMembers = await projectService.getTeamMembers(projectId);
    res.json({ data: teamMembers });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
  getTeamMembers
}; 