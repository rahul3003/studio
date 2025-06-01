const prisma = require('../prisma/client');
const moment = require('moment');

async function createApplicant(data) {
  const { resume, resumeUrl, ...rest } = data; // Remove resume and resumeUrl fields if they exist
  return prisma.applicant.create({ 
    data: {
      ...rest,
      offerHistory: rest.offerHistory || [],
      notes: rest.notes || [],
    },
    include: {
      jobPosting: {
        select: {
          title: true,
          department: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });
}

async function getApplicants() {
  return prisma.applicant.findMany({ orderBy: { createdAt: 'desc' } });
}

async function getApplicantById(id) {
  return prisma.applicant.findUnique({ where: { id } });
}

async function updateApplicant(id, data) {
  // Format dates using moment.js
  const formattedData = { ...data };
  
  if (formattedData.offeredStartDate) {
    formattedData.offeredStartDate = moment(formattedData.offeredStartDate).toISOString();
  }
  
  if (formattedData.offerExpiryDate) {
    formattedData.offerExpiryDate = moment(formattedData.offerExpiryDate).toISOString();
  }

  return prisma.applicant.update({ 
    where: { id }, 
    data: formattedData 
  });
}

async function deleteApplicant(id) {
  return prisma.applicant.delete({ where: { id } });
}

module.exports = {
  createApplicant,
  getApplicants,
  getApplicantById,
  updateApplicant,
  deleteApplicant
};
