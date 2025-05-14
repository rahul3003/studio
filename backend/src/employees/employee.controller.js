const employeeService = require('./employee.service');
const { Prisma } = require('@prisma/client');

// Input validation middleware
const validateEmployeeInput = (req, res, next) => {
  const { name, email, role, designation, status, joinDate, gender, employeeType } = req.body;
  
  if (!name || !email || !role || !designation || !status || !joinDate || !gender || !employeeType) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['name', 'email', 'role', 'designation', 'status', 'joinDate', 'gender', 'employeeType']
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate date format
  if (isNaN(new Date(joinDate).getTime())) {
    return res.status(400).json({ error: 'Invalid join date format' });
  }

  next();
};

// Get all employees
async function getEmployees(req, res) {
  try {
    const employees = await employeeService.getEmployees(req.user);
    res.json(employees);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientInitializationError) {
      return res.status(503).json({ 
        error: 'Database connection error',
        message: 'Service temporarily unavailable'
      });
    }
    console.error('Error fetching employees:', err);
    res.status(500).json({ 
      error: 'Failed to fetch employees',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
}

// Get employee by ID (UUID)
async function getEmployeeById(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }
    const emp = await employeeService.getEmployeeById(id, req.user);
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(emp);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientInitializationError) {
      return res.status(503).json({ 
        error: 'Database connection error',
        message: 'Service temporarily unavailable'
      });
    }
    console.error('Error fetching employee:', err);
    res.status(500).json({ 
      error: 'Failed to fetch employee',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
}

// Create employee
async function createEmployee(req, res) {
  try {
    const emp = await employeeService.createEmployee(req.body);
    res.status(201).json({
      message: 'Employee created successfully',
      data: emp
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return res.status(409).json({ 
          error: 'Email or employeeCode already exists',
          field: 'email or employeeCode'
        });
      }
    }
    console.error('Error creating employee:', err);
    res.status(400).json({ 
      error: 'Failed to create employee',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Invalid input data'
    });
  }
}

// Update employee (by UUID)
async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }
    const emp = await employeeService.updateEmployee(id, req.body);
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({
      message: 'Employee updated successfully',
      data: emp
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return res.status(409).json({ 
          error: 'Email or employeeCode already exists',
          field: 'email or employeeCode'
        });
      }
    }
    console.error('Error updating employee:', err);
    res.status(400).json({ 
      error: 'Failed to update employee',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Invalid input data'
    });
  }
}

// Delete employee (by UUID)
async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }
    await employeeService.deleteEmployee(id);
    res.json({ 
      message: 'Employee deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(400).json({ 
      error: 'Failed to delete employee',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Invalid input data'
    });
  }
}

module.exports = {
  validateEmployeeInput,
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
