const prisma = require('../prisma/client');

async function createJob(data) {
  const { departmentId, ...jobData } = data;
  
  return prisma.jobPosting.create({
    data: {
      ...jobData,
      department: {
        connect: {
          id: departmentId
        }
      }
    },
    include: {
      department: {
        select: {
          name: true,
          id: true
        }
      }
    }
  });
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
  return prisma.jobPosting.findUnique({
    where: { id },
    include: {
      department: {
        select: {
          name: true,
          id: true
        }
      }
    }
  });
}

async function updateJob(id, data) {
  const { departmentId, ...restData } = data;
  return prisma.jobPosting.update({
    where: { id },
    data: {
      ...restData,
      department: departmentId ? {
        connect: {
          id: departmentId
        }
      } : undefined
    },
    include: {
      department: {
        select: {
          name: true,
          id: true
        }
      }
    }
  });
}

async function deleteJob(id) {
  return prisma.jobPosting.delete({
    where: { id },
    include: {
      department: {
        select: {
          name: true,
          id: true
        }
      }
    }
  });
}

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob
}; 