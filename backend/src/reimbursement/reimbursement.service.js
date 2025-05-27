const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const s3Service = require('../s3/s3.service');

async function createReimbursement(data) {
  try {
    const { employeeId, departmentId, projectId, ...rest } = data;
    
    if (rest.submissionDate && typeof rest.submissionDate === 'string' && rest.submissionDate.length === 10) {
      rest.submissionDate = new Date(rest.submissionDate).toISOString();
    }

    // Validate employee
    const employee = await prisma.employee.findUnique({ where: { id: data.payee } });
    if (!employee) throw new Error('Employee not found');

    // Validate department
    const department = await prisma.department.findUnique({ where: { id: data.departmentId } });
    if (!department) throw new Error('Department not found');

    // Handle project connection
    let projectConnect = undefined;
    if (data.projectId) {
      const project = await prisma.project.findUnique({ where: { id: data.projectId } });
      if (!project) throw new Error('Project not found');
      projectConnect = { connect: { id: data.projectId } };
    }

    // Handle approver connection
    let approverConnect = undefined;
    if (data.approverId) {
    const approver = await prisma.employee.findUnique({ where: { id: data.approverId } });
    if (!approver) throw new Error('Approver not found');
      approverConnect = { connect: { id: data.approverId } };
    }

    const reimbursement = await prisma.reimbursement.create({
      data: {
        ...rest,
        employee: { connect: { id: data.payee } },
        department: { connect: { id: data.departmentId } },
        ...(projectConnect && { project: projectConnect }),
        ...(approverConnect && { approver: approverConnect }),
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        employee: true,
        department: true,
        project: true,
        approver: true,
      },
    });
    return reimbursement;
  } catch (error) {
    throw new Error(`Error creating reimbursement: ${error.message}`);
  }
}

async function getReimbursements(filters = {}) {
  try {
    const where = {};
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status) where.status = filters.status;
    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.approverId) where.approverId = filters.approverId;

    const reimbursements = await prisma.reimbursement.findMany({
      where,
      include: {
        employee: true,
        department: true,
        project: true,
        approver: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return reimbursements;
  } catch (error) {
    throw new Error(`Error fetching reimbursements: ${error.message}`);
  }
}

async function getReimbursementById(id) {
  try {
    const reimbursement = await prisma.reimbursement.findUnique({
      where: { id },
      include: {
        employee: true,
        department: true,
        project: true,
        approver: true,
      },
    });
    if (!reimbursement) {
      throw new Error('Reimbursement not found');
    }
    return reimbursement;
  } catch (error) {
    throw new Error(`Error fetching reimbursement: ${error.message}`);
  }
}

async function updateReimbursement(id, data) {
  try {
    const { employeeId, departmentId, projectId, approverId, ...rest } = data;
    const reimbursement = await prisma.reimbursement.update({
      where: { id },
      data: {
        ...rest,
        employee: { connect: { id: data.payee } },
        department: { connect: { id: data.departmentId } },
        project: { connect: { id: data.projectId } },
        approver: { connect: { id: data.approverId } },
        updatedAt: new Date(),
      },
      include: {
        employee: true,
        department: true,
        project: true,
        approver: true,
      },
    });
    return reimbursement;
  } catch (error) {
    throw new Error(`Error updating reimbursement: ${error.message}`);
  }
}

async function deleteReimbursement(id) {
  try {
    const reimbursement = await prisma.reimbursement.delete({
      where: { id },
    });
    return reimbursement;
  } catch (error) {
    throw new Error(`Error deleting reimbursement: ${error.message}`);
  }
}

async function addComment(id, comment) {
  try {
    const reimbursement = await prisma.reimbursement.findUnique({
      where: { id },
      select: { comments: true },
    });

    const updatedComments = [
      ...(reimbursement.comments || []),
      {
        ...comment,
        date: new Date().toISOString(),
      },
    ];

    return await prisma.reimbursement.update({
      where: { id },
      data: {
        comments: updatedComments,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    throw new Error(`Error adding comment: ${error.message}`);
  }
}

async function addHistoryEntry(id, entry) {
  try {
    const reimbursement = await prisma.reimbursement.findUnique({
      where: { id },
      select: { history: true },
    });

    const updatedHistory = [
      ...(reimbursement.history || []),
      {
        ...entry,
        date: new Date().toISOString(),
      },
    ];

    return await prisma.reimbursement.update({
      where: { id },
      data: {
        history: updatedHistory,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    throw new Error(`Error adding history entry: ${error.message}`);
  }
}

async function getPresignedUrl(fileName, contentType) {
  try {
    return await s3Service.getPresignedUrl(fileName, contentType, 'reimbursements');
  } catch (error) {
    throw new Error(`Error getting presigned URL: ${error.message}`);
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