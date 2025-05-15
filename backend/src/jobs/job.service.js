const prisma = require('../prisma/client');

async function createJob(data) {
  return prisma.jobPosting.create({ data });
}

async function getJobs() {
  return prisma.jobPosting.findMany({
    orderBy: { postedDate: 'desc' },
    include: {
      department: {
        select: {
          name: true,
          id: true
        }
      },
    }
  });
}

async function getJobById(id) {
  return prisma.jobPosting.findUnique({ where: { id } });
}

async function updateJob(id, data) {
  return prisma.jobPosting.update({ where: { id }, data });
}

async function deleteJob(id) {
  return prisma.jobPosting.delete({ where: { id } });
}

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob
}; 