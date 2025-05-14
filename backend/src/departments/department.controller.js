const departmentService = require('./department.service');

async function createDepartment(req, res) {
  try {
    const { name, headId, description } = req.body;
    if (!name || !headId || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const department = await departmentService.createDepartment({
      name,
      headId,
      description,
      creationDate: new Date()
    });
    res.status(201).json({ message: 'Department created', data: department });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Department name must be unique' });
    }
    res.status(400).json({ error: 'Failed to create department', message: err.message });
  }
}

async function getDepartments(req, res) {
  try {
    const departments = await departmentService.getDepartments();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch departments', message: err.message });
  }
}

async function updateDepartment(req, res) {
  try {
    const { id } = req.params;
    const { name, headId, description } = req.body;
    if (!id) return res.status(400).json({ error: 'Department ID is required' });
    const updated = await departmentService.updateDepartment(id, { name, headId, description });
    res.json({ message: 'Department updated', data: updated });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.status(400).json({ error: 'Failed to update department', message: err.message });
  }
}

async function deleteDepartment(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Department ID is required' });
    await departmentService.deleteDepartment(id);
    res.json({ message: 'Department deleted' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.status(400).json({ error: 'Failed to delete department', message: err.message });
  }
}

module.exports = {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment
}; 