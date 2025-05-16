require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./auth/auth.routes');
const employeeRoutes = require('./employees/employee.routes');
const departmentRoutes = require('./departments/department.routes');
const jobRoutes = require('./jobs/job.routes');
const s3Routes = require('./s3/s3.routes');
const applicantRoutes = require('./applicants/applicant.routes');
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', employeeRoutes);
app.use('/api', departmentRoutes);
app.use('/api', jobRoutes);
app.use('/api/s3', s3Routes);
app.use('/api', applicantRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something broke!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection first
    await testDatabaseConnection();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please stop the process using this port or set a different PORT in your .env file.`);
        if (process.env.NODE_ENV === 'development') {
          console.error('If you are using nodemon, it will auto-restart when you fix the port issue.');
        }
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

    // Handle process termination
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        prisma.$disconnect();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 