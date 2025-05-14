const prisma = require('../prisma/client');
const { encrypt, decrypt } = require('../utils/encryption');

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
      }
    }
  });
  return employees.map(emp => ({
    ...emp,
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
  const toCreate = { ...data };
  if (toCreate.salary) {
    toCreate.salary = encrypt(toCreate.salary);
  }
  // Generate next employeeCode
  toCreate.employeeCode = await getNextEmployeeCode();
  const employee = await prisma.employee.create({ data: toCreate });
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
  const toUpdate = { ...data };
  if (toUpdate.salary) {
    toUpdate.salary = encrypt(toUpdate.salary);
  }
  return prisma.employee.update({ where: { id }, data: toUpdate });
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
