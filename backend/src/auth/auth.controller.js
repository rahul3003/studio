const bcrypt = require('bcrypt');
const prisma = require('../prisma/client');
const jwt = require('jsonwebtoken');
const employeeService = require('../employees/employee.service');

// Register a new user (employee)
async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate role if provided
    const validRoles = ['SUPERADMIN', 'ADMIN', 'MANAGER', 'HR', 'ACCOUNTS', 'EMPLOYEE'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role',
        validRoles: validRoles
      });
    }

    // Check if user exists
    const existing = await prisma.employee.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate next employeeCode
    const employeeCode = await employeeService.getNextEmployeeCode();

    // Generate JWT
    const userData = {
      name,
      email,
      passwordHash,
      role: role || "EMPLOYEE",
      designation: "DEVELOPER",
      status: "ACTIVE",
      joinDate: new Date(),
      gender: "MALE",
      employeeType: "FULL_TIME",
      employeeCode
    };

    // Create user
    const user = await prisma.employee.create({ data: userData });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Store token in DB
    await prisma.employee.update({ where: { id: user.id }, data: { jwtToken: token } });

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        id: user.id,
        employeeCode: user.employeeCode,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      error: 'Failed to register user',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
}

// Login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find user
    const user = await prisma.employee.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email, Please contact your administrator' });

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid password, Please contact your administrator' });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Store token in DB
    await prisma.employee.update({ where: { id: user.id }, data: { jwtToken: token } });

    res.json({
      message: 'Login successful',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      error: 'Failed to login',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
}

module.exports = { register, login }; 