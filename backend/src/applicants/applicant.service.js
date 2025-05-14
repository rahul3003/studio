const prisma = require('../prisma/client');

async function createApplicant(data) {
  return prisma.applicant.create({ data });
}

async function getApplicants() {
  return prisma.applicant.findMany({ orderBy: { createdAt: 'desc' } });
}

async function getApplicantById(id) {
  return prisma.applicant.findUnique({ where: { id } });
}

async function updateApplicant(id, data) {
  return prisma.applicant.update({ where: { id }, data });
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
