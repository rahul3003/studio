const jobService = require('./job.service');

async function createJob(req, res) {
  try {
    const job = await jobService.createJob({ ...req.body, postedDate: new Date() });
    res.status(201).json({ message: 'Job created', data: job });
  } catch (err) {
    res.status(400).json({ error: 'Failed to create job', message: err.message });
  }
}

async function getJobs(req, res) {
  try {
    const jobs = await jobService.getJobs();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs', message: err.message });
  }
}

async function getJobById(req, res) {
  try {
    const { id } = req.params;
    const job = await jobService.getJobById(id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch job', message: err.message });
  }
}

async function updateJob(req, res) {
  try {
    const { id } = req.params;
    const job = await jobService.updateJob(id, req.body);
    res.json({ message: 'Job updated', data: job });
  } catch (err) {
    res.status(400).json({ error: 'Failed to update job', message: err.message });
  }
}

async function deleteJob(req, res) {
  try {
    const { id } = req.params;
    await jobService.deleteJob(id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete job', message: err.message });
  }
}

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob
}; 