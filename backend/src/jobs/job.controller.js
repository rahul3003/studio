const jobService = require('./job.service');

async function createJob(req, res) {
  try {
    if (!req.body.departmentId) {
      return res.status(400).json({ 
        error: 'Failed to create job', 
        message: 'Department ID is required' 
      });
    }

    const job = await jobService.createJob(req.body);
    res.status(201).json({ 
      success: true,
      message: 'Job created successfully', 
      data: job 
    });
  } catch (err) {
    console.error('Create job error:', err);
    res.status(400).json({ 
      success: false,
      error: 'Failed to create job', 
      message: err.message 
    });
  }
}

async function getJobs(req, res) {
  try {
    const jobs = await jobService.getJobs();
    res.json({ 
      success: true,
      data: jobs 
    });
  } catch (err) {
    console.error('Get jobs error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch jobs', 
      message: err.message 
    });
  }
}

async function getJobById(req, res) {
  try {
    const { id } = req.params;
    const job = await jobService.getJobById(id);
    if (!job) {
      return res.status(404).json({ 
        success: false,
        error: 'Job not found' 
      });
    }
    res.json({ 
      success: true,
      data: job 
    });
  } catch (err) {
    console.error('Get job error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch job', 
      message: err.message 
    });
  }
}

async function updateJob(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'Job ID is required' 
      });
    }

    const job = await jobService.updateJob(id, req.body);
    res.json({ 
      success: true,
      message: 'Job updated successfully', 
      data: job 
    });
  } catch (err) {
    console.error('Update job error:', err);
    res.status(400).json({ 
      success: false,
      error: 'Failed to update job', 
      message: err.message 
    });
  }
}

async function deleteJob(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'Job ID is required' 
      });
    }

    await jobService.deleteJob(id);
    res.json({ 
      success: true,
      message: 'Job deleted successfully' 
    });
  } catch (err) {
    console.error('Delete job error:', err);
    res.status(400).json({ 
      success: false,
      error: 'Failed to delete job', 
      message: err.message 
    });
  }
}

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob
}; 