const prisma = require('../prisma/client');

async function createDepartment(data) {
  const { headId, ...rest } = data;
  return prisma.department.create({
    data: {
      ...rest,
      head: { connect: { id: headId } }
    }
  });
}

async function getDepartments() {
  return prisma.department.findMany({ orderBy: { creationDate: 'desc' } });
}

async function updateDepartment(id, data) {
  const { headId, ...rest } = data;
  return prisma.department.update({
    where: { id },
    data: {
      ...rest,
      ...(headId && { head: { connect: { id: headId } } })
    }
  });
}

async function deleteDepartment(id) {
  return prisma.department.delete({ where: { id } });
}

module.exports = {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment
}; 