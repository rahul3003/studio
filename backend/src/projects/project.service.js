const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const moment = require('moment');

async function createProject(data) {
  try {
    const { projectManagerId, departmentId, ...rest } = data;

    // Validate project manager
    if (!projectManagerId) {
      throw new Error("Project Manager ID is required.");
    }

    const projectManager = await prisma.employee.findUnique({
      where: {
        id: projectManagerId,
      },
    });
    if (!projectManager) {
      throw new Error("Project Manager not found.");
    }

    // Validate department if provided
    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId }
      });
      if (!department) throw new Error('Department not found');
    }

    // Ensure startDate and endDate are valid ISO strings
    let { startDate, endDate } = rest;
    if (startDate && moment(startDate).isValid()) {
      startDate = moment(startDate).toISOString();
    } else {
      startDate = undefined;
    }
    if (endDate && moment(endDate).isValid()) {
      endDate = moment(endDate).toISOString();
    } else {
      endDate = undefined;
    }

    const project = await prisma.project.create({
      data: {
        ...rest,
        startDate,
        endDate,
        projectManager: { connect: { id: projectManagerId } },
        ...(departmentId && { department: { connect: { id: departmentId } } }),
        createdAt: new Date(),
        updatedAt: new Date(),
        teamMembersString: rest.teamMembers || "",
      },
      include: {
        projectManager: true,
        department: true,
        tasks: true,
      },
    });
    return project;
  } catch (error) {
    throw new Error(`Error creating project: ${error.message}`);
  }
}

async function getProjects(filters = {}) {
  try {
    const where = {};
    if (filters.projectManagerId) where.projectManagerId = filters.projectManagerId;
    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.status) where.status = filters.status;

    const projects = await prisma.project.findMany({
      where,
      include: {
        projectManager: true,
        department: true,
        tasks: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return projects;
  } catch (error) {
    throw new Error(`Error fetching projects: ${error.message}`);
  }
}

async function getProjectById(id) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        projectManager: true,
        department: true,
        tasks: true,
      },
    });
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  } catch (error) {
    throw new Error(`Error fetching project: ${error.message}`);
  }
}

async function updateProject(id, data) {
  try {
    const { projectManagerId, departmentId, ...rest } = data;

    // Validate project manager if provided
    if (projectManagerId) {
      const projectManager = await prisma.employee.findUnique({
        where: { id: projectManagerId }
      });
      if (!projectManager) throw new Error('Project manager not found');
    }

    // Validate department if provided
    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId }
      });
      if (!department) throw new Error('Department not found');
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...rest,
        ...(projectManagerId && { projectManager: { connect: { id: projectManagerId } } }),
        ...(departmentId && { department: { connect: { id: departmentId } } }),
        updatedAt: new Date(),
      },
      include: {
        projectManager: true,
        department: true,
        tasks: true,
      },
    });
    return project;
  } catch (error) {
    throw new Error(`Error updating project: ${error.message}`);
  }
}

async function deleteProject(id) {
  try {
    const project = await prisma.project.delete({
      where: { id },
    });
    return project;
  } catch (error) {
    throw new Error(`Error deleting project: ${error.message}`);
  }
}

async function addTeamMember(projectId, employeeId) {
  try {
    // Validate project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { projectManager: true }
    });
    if (!project) throw new Error('Project not found');

    // Validate employee
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });
    if (!employee) throw new Error('Employee not found');

    // Get current team members
    const currentMembers = project.teamMembersString ? project.teamMembersString.split(',') : [];
    
    // Check if employee is already a member
    if (currentMembers.includes(employeeId)) {
      throw new Error('Employee is already a team member');
    }

    // Add new member
    const updatedMembers = [...currentMembers, employeeId];
    
    // Update project with new team members
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        teamMembersString: updatedMembers.join(','),
        updatedAt: new Date()
      },
      include: {
        projectManager: true,
        department: true,
        tasks: true
      }
    });

    return updatedProject;
  } catch (error) {
    throw new Error(`Error adding team member: ${error.message}`);
  }
}

async function removeTeamMember(projectId, employeeId) {
  try {
    // Validate project
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });
    if (!project) throw new Error('Project not found');

    // Get current team members
    const currentMembers = project.teamMembersString ? project.teamMembersString.split(',') : [];
    
    // Check if employee is a member
    if (!currentMembers.includes(employeeId)) {
      throw new Error('Employee is not a team member');
    }

    // Remove member
    const updatedMembers = currentMembers.filter(id => id !== employeeId);
    
    // Update project with new team members
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        teamMembersString: updatedMembers.join(','),
        updatedAt: new Date()
      },
      include: {
        projectManager: true,
        department: true,
        tasks: true
      }
    });

    return updatedProject;
  } catch (error) {
    throw new Error(`Error removing team member: ${error.message}`);
  }
}

async function getTeamMembers(projectId) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        projectManager: true
      }
    });
    
    if (!project) throw new Error('Project not found');

    const memberIds = project.teamMembersString ? project.teamMembersString.split(',') : [];
    
    // Get all team members including project manager
    const teamMembers = await prisma.employee.findMany({
      where: {
        id: {
          in: [...memberIds, project.projectManagerId]
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        designation: true,
        avatarUrl: true
      }
    });

    return {
      projectManager: teamMembers.find(m => m.id === project.projectManagerId),
      teamMembers: teamMembers.filter(m => m.id !== project.projectManagerId)
    };
  } catch (error) {
    throw new Error(`Error fetching team members: ${error.message}`);
  }
}

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
  getTeamMembers
}; 