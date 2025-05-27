const reimbursementService = require('./reimbursement.service');

async function createReimbursement(req, res) {
  try {
    const reimbursement = await reimbursementService.createReimbursement(req.body);
    res.status(201).json({ message: 'Reimbursement created', data: reimbursement });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getReimbursements(req, res) {
  try {
    const filters = {
      employeeId: req.query.employeeId,
      status: req.query.status,
      departmentId: req.query.departmentId,
      projectId: req.query.projectId,
      approverId: req.query.approverId,
    };
    const reimbursements = await reimbursementService.getReimbursements(filters);
    res.json(reimbursements);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getReimbursementById(req, res) {
  try {
    const reimbursement = await reimbursementService.getReimbursementById(req.params.id);
    res.json(reimbursement);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function updateReimbursement(req, res) {
  try {
    const reimbursement = await reimbursementService.updateReimbursement(
      req.params.id,
      req.body
    );
    res.json({ message: 'Reimbursement updated', data: reimbursement });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deleteReimbursement(req, res) {
  try {
    await reimbursementService.deleteReimbursement(req.params.id);
    res.json({ message: 'Reimbursement deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function addComment(req, res) {
  try {
    const { id } = req.params;
    const { text, user } = req.body;
    const reimbursement = await reimbursementService.addComment(id, { text, user });
    res.json(reimbursement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function addHistoryEntry(req, res) {
  try {
    const { id } = req.params;
    const { action, details, user } = req.body;
    const reimbursement = await reimbursementService.addHistoryEntry(id, {
      action,
      details,
      user,
    });
    res.json(reimbursement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getPresignedUrl(req, res) {
  try {
    const { fileName, contentType } = req.body;
    const presignedUrl = await reimbursementService.getPresignedUrl(fileName, contentType);
    res.json(presignedUrl);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  createReimbursement,
  getReimbursements,
  getReimbursementById,
  updateReimbursement,
  deleteReimbursement,
  addComment,
  addHistoryEntry,
  getPresignedUrl
}; 