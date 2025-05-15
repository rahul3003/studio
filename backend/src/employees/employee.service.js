const prisma = require('../prisma/client');
const { encrypt, decrypt } = require('../utils/encryption');
const bcrypt = require('bcrypt');
const moment = require('moment');

// Roles allowed to view decrypted salary
const ALLOWED_SALARY_ROLES = ['SUPERADMIN', 'ADMIN', 'ACCOUNTS'];

// Generate the next employeeCode (EMPVL###)
async function getNextEmployeeCode() {
  // Find the max employeeCode in the format EMPVL###
  const last = await prisma.employee.findFirst({
    where: { employeeCode: { startsWith: 'EMPVL' } },
    orderBy: { employeeCode: 'desc' },
    select: { employeeCode: true },
  });
  let nextNum = 1;
  if (last && last.employeeCode) {
    const match = last.employeeCode.match(/EMPVL(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }
  return `EMPVL${String(nextNum).padStart(3, '0')}`;
}

async function getEmployees(currentUser) {
  const employees = await prisma.employee.findMany({
    orderBy: { employeeCode: 'asc' },
    include: {
      reportingManager: {
        select: { id: true, name: true }
      },
      department:{
        select:{id:true, name:true}
      }
    }
  });

  return employees.map(emp => ({
    ...emp,
    designation: emp.designation.toUpperCase(),
    joinDate: moment(emp.joinDate).format('YYYY-MM-DD'),
    reportingManager: emp.reportingManager
      ? { id: emp.reportingManager.id, name: emp.reportingManager.name }
      : null,
    salary: canViewSalary(currentUser, emp) ? (emp.salary ? decrypt(emp.salary) : null) : '#####',
  }));
}

async function getEmployeeById(id, currentUser) {
  const emp = await prisma.employee.findUnique({
    where: { id },
    include: {
      reportingManager: {
        select: { id: true, name: true }
      },
      department: {
        select: { id: true, name: true }
      }
    }
  });
  if (!emp) return null;
  return {
    ...emp,
    reportingManager: emp.reportingManager
      ? { id: emp.reportingManager.id, name: emp.reportingManager.name }
      : null,
    salary: canViewSalary(currentUser, emp) ? (emp.salary ? decrypt(emp.salary) : null) : '#####',
  };
}

async function createEmployee(data) {
  let toCreate = { ...data };
  
  // Handle salary encryption if present
  if (toCreate.salary) {
    toCreate.salary = encrypt(toCreate.salary);
  }

  // Ensure joinDate is in ISO format
  if (toCreate.joinDate) {
    toCreate.joinDate = moment(toCreate.joinDate).toISOString();
  }

  // Ensure designation type is uppercase
  if (toCreate.designation) {
    toCreate.designation = toCreate.designation.toUpperCase();
  }

  // Generate next employeeCode
  toCreate.employeeCode = await getNextEmployeeCode();
  const hashedPassword = await bcrypt.hash(toCreate.email, 10);
  
  // Handle relations
  const reportingManagerId = toCreate.reportingManagerId;
  const departmentId = toCreate.departmentId;
  delete toCreate.reportingManagerId;
  delete toCreate.departmentId;

  console.log(toCreate.departmentId);
  
  const employee = await prisma.employee.create({ 
    data: {
      ...toCreate,
      passwordHash: hashedPassword,
      reportingManager: reportingManagerId ? {
        connect: { id: reportingManagerId }
      } : undefined,
      department: departmentId ? {
        connect: { id: departmentId }
      } : undefined
    }
  });
  
  // Create notification
  await prisma.notification.create({
    data: {
      type: 'EMPLOYEE_CREATED',
      message: `New employee created: ${employee.name}`,
      employeeId: employee.id
    }
  });
  
  return employee;
}

async function updateEmployee(id, data) {
  let toUpdate = { ...data };
  
  // Handle salary encryption if present
  if (toUpdate.salary) {
    toUpdate.salary = encrypt(toUpdate.salary);
  }

  // Ensure joinDate is in ISO format
  if (toUpdate.joinDate) {
    toUpdate.joinDate = moment(toUpdate.joinDate).toISOString();
  }

  // Ensure designation is uppercase
  if (toUpdate.designation) {
    toUpdate.designation = toUpdate.designation.toUpperCase();
  }

  // Handle relations
  const reportingManagerId = toUpdate.reportingManagerId;
  const departmentId = toUpdate.departmentId;
  delete toUpdate.reportingManagerId;
  delete toUpdate.departmentId;

  return prisma.employee.update({ 
    where: { id }, 
    data: {
      ...toUpdate,
      reportingManager: reportingManagerId ? {
        connect: { id: reportingManagerId }
      } : undefined,
      department: departmentId ? {
        connect: { id: departmentId }
      } : undefined
    }
  });
}

async function deleteEmployee(id) {
  return prisma.employee.delete({ where: { id } });
}

function canViewSalary(currentUser, employee) {
  if (!currentUser) return false;
  if (ALLOWED_SALARY_ROLES.includes(currentUser.role)) return true;
  if (currentUser.id === employee.id) return true;
  return false;
}

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getNextEmployeeCode
};
