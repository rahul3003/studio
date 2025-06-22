const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSampleSalaryData() {
  try {
    console.log('Creating sample salary data...');

    // First, let's get some employees
    const employees = await prisma.employee.findMany({
      take: 5,
      include: {
        department: true
      }
    });

    if (employees.length === 0) {
      console.log('No employees found. Please create employees first.');
      return;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Create sample salary records for each employee
    for (const employee of employees) {
      // Create salary for current month
      const basicSalary = 50000 + Math.floor(Math.random() * 50000); // Random salary between 50k-100k
      const hra = basicSalary * 0.4; // 40% of basic
      const da = basicSalary * 0.1; // 10% of basic
      const conveyanceAllowance = 1600;
      const medicalAllowance = 1250;
      const specialAllowance = basicSalary * 0.2; // 20% of basic
      
      const totalAllowances = hra + da + conveyanceAllowance + medicalAllowance + specialAllowance;
      const grossEarnings = basicSalary + totalAllowances;
      
      const providentFund = basicSalary * 0.12; // 12% of basic
      const professionalTax = 200;
      const tds = grossEarnings * 0.05; // 5% of gross
      const totalDeductions = providentFund + professionalTax + tds;
      const netSalary = grossEarnings - totalDeductions;

      await prisma.monthlySalary.create({
        data: {
          employeeId: employee.id,
          year: currentYear,
          month: currentMonth,
          payPeriodStart: new Date(currentYear, currentMonth - 2, 25), // 25th of previous month
          payPeriodEnd: new Date(currentYear, currentMonth - 1, 25), // 25th of current month
          paymentDate: new Date(currentYear, currentMonth, 6), // 6th of next month
          basicSalary,
          hra,
          da,
          conveyanceAllowance,
          medicalAllowance,
          specialAllowance,
          otherAllowances: 0,
          bonus: 0,
          incentives: 0,
          overtime: 0,
          otherEarnings: 0,
          providentFund,
          professionalTax,
          tds,
          otherDeductions: 0,
          grossEarnings,
          totalDeductions,
          netSalary,
          workingDays: 22,
          paidDays: 20,
          leaveDays: 2,
          holidays: 0,
          status: 'PENDING',
          remarks: 'Sample salary record'
        }
      });

      console.log(`Created salary record for ${employee.name} - ${basicSalary} basic salary`);
    }

    console.log('Sample salary data created successfully!');
  } catch (error) {
    console.error('Error creating sample salary data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  createSampleSalaryData();
}

module.exports = { createSampleSalaryData }; 