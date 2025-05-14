const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Prisma: Database connected');
  } catch (err) {
    console.error('Prisma: Database connection failed:', err.message);
    process.exit(1);
  }
}

testConnection();

module.exports = prisma;
