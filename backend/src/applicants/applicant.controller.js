const applicantService = require('./applicant.service');

async function createApplicant(req, res) {
  try {
    const applicant = await applicantService.createApplicant({ ...req.body, createdAt: new Date(), updatedAt: new Date() });
    res.status(201).json({ message: 'Applicant created', data: applicant });
  } catch (err) {
    res.status(400).json({ error: 'Failed to create applicant', message: err.message });
  }
}

async function getApplicants(req, res) {
  try {
    const applicants = await applicantService.getApplicants();
    res.json(applicants);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applicants', message: err.message });
  }
}

async function getApplicantById(req, res) {
  try {
    const { id } = req.params;
    const applicant = await applicantService.getApplicantById(id);
    if (!applicant) return res.status(404).json({ error: 'Applicant not found' });
    res.json(applicant);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applicant', message: err.message });
  }
}

async function updateApplicant(req, res) {
  try {
    const { id } = req.params;
    const applicant = await applicantService.updateApplicant(id, { ...req.body, updatedAt: new Date() });
    res.json({ message: 'Applicant updated', data: applicant });
  } catch (err) {
    res.status(400).json({ error: 'Failed to update applicant', message: err.message });
  }
}

async function deleteApplicant(req, res) {
  try {
    const { id } = req.params;
    await applicantService.deleteApplicant(id);
    res.json({ message: 'Applicant deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete applicant', message: err.message });
  }
}

module.exports = {
  createApplicant,
  getApplicants,
  getApplicantById,
  updateApplicant,
  deleteApplicant
};
