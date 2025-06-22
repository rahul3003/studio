const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SalaryService {
  // Create a new monthly salary record
  async createMonthlySalary(employeeId, salaryData) {
    try {
      const {
        year,
        month,
        payPeriodStart,
        payPeriodEnd,
        paymentDate,
        basicSalary,
        hra = 0,
        da = 0,
        conveyanceAllowance = 0,
        medicalAllowance = 0,
        specialAllowance = 0,
        otherAllowances = 0,
        bonus = 0,
        incentives = 0,
        overtime = 0,
        otherEarnings = 0,
        providentFund = 0,
        professionalTax = 0,
        tds = 0,
        otherDeductions = 0,
        workingDays,
        paidDays,
        leaveDays = 0,
        holidays = 0,
        remarks
      } = salaryData;

      // Calculate totals
      const totalAllowances = hra + da + conveyanceAllowance + medicalAllowance + specialAllowance + otherAllowances;
      const totalEarnings = bonus + incentives + overtime + otherEarnings;
      const grossEarnings = basicSalary + totalAllowances + totalEarnings;
      const totalDeductions = providentFund + professionalTax + tds + otherDeductions;
      const netSalary = grossEarnings - totalDeductions;

      const monthlySalary = await prisma.monthlySalary.create({
        data: {
          employeeId,
          year,
          month,
          payPeriodStart: new Date(payPeriodStart),
          payPeriodEnd: new Date(payPeriodEnd),
          paymentDate: new Date(paymentDate),
          basicSalary,
          hra,
          da,
          conveyanceAllowance,
          medicalAllowance,
          specialAllowance,
          otherAllowances,
          bonus,
          incentives,
          overtime,
          otherEarnings,
          providentFund,
          professionalTax,
          tds,
          otherDeductions,
          grossEarnings,
          totalDeductions,
          netSalary,
          workingDays,
          paidDays,
          leaveDays,
          holidays,
          remarks,
          status: 'PENDING'
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employeeCode: true
            }
          }
        }
      });

      return monthlySalary;
    } catch (error) {
      throw new Error(`Failed to create monthly salary: ${error.message}`);
    }
  }

  // Get monthly salary by ID
  async getMonthlySalaryById(id) {
    try {
      const monthlySalary = await prisma.monthlySalary.findUnique({
        where: { id },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employeeCode: true,
              designation: true,
              department: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      if (!monthlySalary) {
        throw new Error('Monthly salary record not found');
      }

      return monthlySalary;
    } catch (error) {
      throw new Error(`Failed to get monthly salary: ${error.message}`);
    }
  }

  // Get monthly salary by employee and month
  async getMonthlySalaryByEmployeeAndMonth(employeeId, year, month) {
    try {
      const monthlySalary = await prisma.monthlySalary.findUnique({
        where: {
          employeeId_year_month: {
            employeeId,
            year,
            month
          }
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employeeCode: true,
              designation: true,
              department: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      return monthlySalary;
    } catch (error) {
      throw new Error(`Failed to get monthly salary: ${error.message}`);
    }
  }

  // Get all monthly salaries for an employee
  async getMonthlySalariesByEmployee(employeeId, year = null) {
    try {
      const where = { employeeId };
      if (year) {
        where.year = year;
      }

      const monthlySalaries = await prisma.monthlySalary.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employeeCode: true
            }
          }
        },
        orderBy: [
          { year: 'desc' },
          { month: 'desc' }
        ]
      });

      return monthlySalaries;
    } catch (error) {
      throw new Error(`Failed to get monthly salaries: ${error.message}`);
    }
  }

  // Get all monthly salaries with filters
  async getAllMonthlySalaries(filters = {}) {
    try {
      const {
        year,
        month,
        status,
        departmentId,
        page = 1,
        limit = 10
      } = filters;

      const where = {};
      if (year) where.year = year;
      if (month) where.month = month;
      if (status) where.status = status;

      const skip = (page - 1) * limit;

      const [monthlySalaries, total] = await Promise.all([
        prisma.monthlySalary.findMany({
          where,
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
                employeeCode: true,
                designation: true,
                department: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          },
          orderBy: [
            { year: 'desc' },
            { month: 'desc' }
          ],
          skip,
          take: limit
        }),
        prisma.monthlySalary.count({ where })
      ]);

      return {
        monthlySalaries: monthlySalaries || [], // Ensure we always return an array
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      // Return empty result instead of throwing error
      return {
        monthlySalaries: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  // Update monthly salary
  async updateMonthlySalary(id, updateData) {
    try {
      // Recalculate totals if salary components are updated
      if (updateData.basicSalary || updateData.hra || updateData.da || 
          updateData.conveyanceAllowance || updateData.medicalAllowance || 
          updateData.specialAllowance || updateData.otherAllowances ||
          updateData.bonus || updateData.incentives || updateData.overtime || 
          updateData.otherEarnings || updateData.providentFund || 
          updateData.professionalTax || updateData.tds || updateData.otherDeductions) {
        
        const existing = await prisma.monthlySalary.findUnique({ where: { id } });
        if (!existing) {
          throw new Error('Monthly salary record not found');
        }

        const {
          basicSalary = existing.basicSalary,
          hra = existing.hra,
          da = existing.da,
          conveyanceAllowance = existing.conveyanceAllowance,
          medicalAllowance = existing.medicalAllowance,
          specialAllowance = existing.specialAllowance,
          otherAllowances = existing.otherAllowances,
          bonus = existing.bonus,
          incentives = existing.incentives,
          overtime = existing.overtime,
          otherEarnings = existing.otherEarnings,
          providentFund = existing.providentFund,
          professionalTax = existing.professionalTax,
          tds = existing.tds,
          otherDeductions = existing.otherDeductions
        } = updateData;

        const totalAllowances = hra + da + conveyanceAllowance + medicalAllowance + specialAllowance + otherAllowances;
        const totalEarnings = bonus + incentives + overtime + otherEarnings;
        const grossEarnings = basicSalary + totalAllowances + totalEarnings;
        const totalDeductions = providentFund + professionalTax + tds + otherDeductions;
        const netSalary = grossEarnings - totalDeductions;

        updateData.grossEarnings = grossEarnings;
        updateData.totalDeductions = totalDeductions;
        updateData.netSalary = netSalary;
      }

      const monthlySalary = await prisma.monthlySalary.update({
        where: { id },
        data: updateData,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employeeCode: true
            }
          }
        }
      });

      return monthlySalary;
    } catch (error) {
      throw new Error(`Failed to update monthly salary: ${error.message}`);
    }
  }

  // Approve monthly salary
  async approveMonthlySalary(id, approvedBy, remarks = null) {
    try {
      const monthlySalary = await prisma.monthlySalary.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedBy,
          approvedAt: new Date(),
          remarks
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employeeCode: true
            }
          }
        }
      });

      return monthlySalary;
    } catch (error) {
      throw new Error(`Failed to approve monthly salary: ${error.message}`);
    }
  }

  // Reject monthly salary
  async rejectMonthlySalary(id, rejectedBy, remarks = null) {
    try {
      const monthlySalary = await prisma.monthlySalary.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectedBy,
          rejectedAt: new Date(),
          remarks
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employeeCode: true
            }
          }
        }
      });

      return monthlySalary;
    } catch (error) {
      throw new Error(`Failed to reject monthly salary: ${error.message}`);
    }
  }

  // Mark salary as paid
  async markSalaryAsPaid(id) {
    try {
      const monthlySalary = await prisma.monthlySalary.update({
        where: { id },
        data: {
          status: 'PAID'
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employeeCode: true
            }
          }
        }
      });

      return monthlySalary;
    } catch (error) {
      throw new Error(`Failed to mark salary as paid: ${error.message}`);
    }
  }

  // Update payslip URL
  async updatePayslipUrl(id, payslipUrl) {
    try {
      const monthlySalary = await prisma.monthlySalary.update({
        where: { id },
        data: {
          payslipUrl,
          payslipGeneratedAt: new Date()
        }
      });

      return monthlySalary;
    } catch (error) {
      throw new Error(`Failed to update payslip URL: ${error.message}`);
    }
  }

  // Delete monthly salary
  async deleteMonthlySalary(id) {
    try {
      await prisma.monthlySalary.delete({
        where: { id }
      });

      return { message: 'Monthly salary record deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete monthly salary: ${error.message}`);
    }
  }

  // Get salary statistics
  async getSalaryStatistics(year, month) {
    try {
      const where = {};
      if (year) where.year = year;
      if (month) where.month = month;

      const [totalSalaries, totalAmount, averageSalary, pendingCount, approvedCount, paidCount, rejectedCount] = await Promise.all([
        prisma.monthlySalary.count({ where }),
        prisma.monthlySalary.aggregate({
          where,
          _sum: { netSalary: true }
        }),
        prisma.monthlySalary.aggregate({
          where,
          _avg: { netSalary: true }
        }),
        prisma.monthlySalary.count({ where: { ...where, status: 'PENDING' } }),
        prisma.monthlySalary.count({ where: { ...where, status: 'APPROVED' } }),
        prisma.monthlySalary.count({ where: { ...where, status: 'PAID' } }),
        prisma.monthlySalary.count({ where: { ...where, status: 'REJECTED' } })
      ]);

      // Get department-wise statistics
      const departmentStats = await prisma.monthlySalary.groupBy({
        by: ['employee'],
        where,
        _sum: { netSalary: true },
        _count: true
      });

      const departmentData = await Promise.all(
        departmentStats.map(async (dept) => {
          const employee = await prisma.employee.findUnique({
            where: { id: dept.employee.id },
            include: { department: true }
          });
          return {
            name: employee?.department?.name || 'No Department',
            totalSalary: dept._sum.netSalary || 0,
            count: dept._count
          };
        })
      );

      // Calculate percentages for department stats
      const totalPayroll = totalAmount._sum.netSalary || 0;
      const departmentStatsWithPercentage = departmentData.map(dept => ({
        ...dept,
        percentage: totalPayroll > 0 ? (dept.totalSalary / totalPayroll) * 100 : 0
      }));

      // Get monthly trends for the last 6 months
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      const monthlyTrends = [];
      for (let i = 5; i >= 0; i--) {
        const targetMonth = currentMonth - i;
        const targetYear = currentYear;
        
        const monthData = await prisma.monthlySalary.aggregate({
          where: { 
            year: targetYear,
            month: targetMonth
          },
          _sum: { netSalary: true }
        });

        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];

        monthlyTrends.push({
          month: monthNames[targetMonth - 1] || 'Unknown',
          amount: monthData._sum.netSalary || 0
        });
      }

      // Get total employees count
      const totalEmployees = await prisma.employee.count({
        where: { status: 'ACTIVE' }
      });

      return {
        totalSalaries,
        totalPayroll: totalAmount._sum.netSalary || 0,
        averageSalary: averageSalary._avg.netSalary || 0,
        pendingApprovals: pendingCount,
        approvedCount,
        paidCount,
        rejectedCount,
        totalEmployees,
        departmentStats: departmentStatsWithPercentage || [],
        monthlyTrends: monthlyTrends || []
      };
    } catch (error) {
      // Return default statistics instead of throwing error
      return {
        totalSalaries: 0,
        totalPayroll: 0,
        averageSalary: 0,
        pendingApprovals: 0,
        approvedCount: 0,
        paidCount: 0,
        rejectedCount: 0,
        totalEmployees: 0,
        departmentStats: [],
        monthlyTrends: []
      };
    }
  }

  // Create sample salary data
  async createSampleData() {
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
        return []; // Return empty array instead of throwing error
      }

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const createdSalaries = [];

      // Create sample salary records for each employee
      for (const employee of employees) {
        // Check if salary record already exists for this employee and month
        const existingSalary = await prisma.monthlySalary.findUnique({
          where: {
            employeeId_year_month: {
              employeeId: employee.id,
              year: currentYear,
              month: currentMonth
            }
          }
        });

        if (existingSalary) {
          console.log(`Salary record already exists for ${employee.name} for ${currentMonth}/${currentYear}`);
          continue; // Skip this employee
        }

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

        const salary = await prisma.monthlySalary.create({
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
          },
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
                employeeCode: true,
                department: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        });

        createdSalaries.push(salary);
        console.log(`Created salary record for ${employee.name} - ${basicSalary} basic salary`);
      }

      if (createdSalaries.length === 0) {
        console.log('No new salary records created (all employees already have salary records for this month)');
      } else {
        console.log(`Created ${createdSalaries.length} new salary records`);
      }

      return createdSalaries;
    } catch (error) {
      console.error('Error creating sample data:', error);
      return []; // Return empty array on error instead of throwing
    }
  }
}

module.exports = new SalaryService(); 