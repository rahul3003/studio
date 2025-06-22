# Salary Module

This module handles all salary-related operations including monthly salary tracking, calculations, and management.

## Folder Structure

```
salary/
├── salary.service.js      # Business logic for salary operations
├── salary.controller.js   # HTTP request/response handling
├── salary.routes.js       # API route definitions
├── index.js              # Module exports
└── README.md             # This documentation
```

## Features

### Monthly Salary Management
- Create, read, update, delete monthly salary records
- Automatic calculation of totals (gross earnings, deductions, net salary)
- Employee-specific salary tracking
- Pay period and payment date management

### Salary Components
- **Basic Salary**: Core salary amount
- **Allowances**: HRA, DA, conveyance, medical, special, other allowances
- **Additional Earnings**: Bonus, incentives, overtime, other earnings
- **Deductions**: Provident Fund, Professional Tax, TDS, other deductions

### Workflow Management
- **Status Tracking**: PENDING → APPROVED → PAID
- **Approval Process**: Track who approved and when
- **Payslip Integration**: Store payslip URLs and generation timestamps

### Analytics & Reporting
- Salary statistics by month/year
- Department-wise analysis
- Status-based filtering and pagination

## API Endpoints

### Base URL: `/api/salaries`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/employees/:employeeId/monthly-salaries` | Create monthly salary |
| GET | `/monthly-salaries/:id` | Get salary by ID |
| GET | `/employees/:employeeId/monthly-salaries/:year/:month` | Get by employee & month |
| GET | `/employees/:employeeId/monthly-salaries` | Get all for employee |
| GET | `/monthly-salaries` | Get all with filters |
| PUT | `/monthly-salaries/:id` | Update salary |
| PATCH | `/monthly-salaries/:id/approve` | Approve salary |
| PATCH | `/monthly-salaries/:id/mark-paid` | Mark as paid |
| PATCH | `/monthly-salaries/:id/payslip` | Update payslip URL |
| DELETE | `/monthly-salaries/:id` | Delete salary |
| GET | `/monthly-salaries/statistics` | Get statistics |

## Database Schema

### MonthlySalary Model
```prisma
model MonthlySalary {
  id                    String   @id @default(cuid())
  employeeId            String
  employee              Employee @relation(fields: [employeeId], references: [id])
  year                  Int
  month                 Int
  payPeriodStart        DateTime
  payPeriodEnd          DateTime
  paymentDate           DateTime
  
  // Salary components
  basicSalary           Float
  hra                   Float    @default(0)
  da                    Float    @default(0)
  conveyanceAllowance   Float    @default(0)
  medicalAllowance      Float    @default(0)
  specialAllowance      Float    @default(0)
  otherAllowances       Float    @default(0)
  
  // Additional earnings
  bonus                 Float    @default(0)
  incentives            Float    @default(0)
  overtime              Float    @default(0)
  otherEarnings         Float    @default(0)
  
  // Deductions
  providentFund         Float    @default(0)
  professionalTax       Float    @default(0)
  tds                   Float    @default(0)
  otherDeductions       Float    @default(0)
  
  // Calculated totals
  grossEarnings         Float
  totalDeductions       Float
  netSalary             Float
  
  // Attendance details
  workingDays           Int
  paidDays              Int
  leaveDays             Int
  holidays              Int
  
  // Status and approval
  status                SalaryStatus @default(PENDING)
  approvedBy            String?
  approvedAt            DateTime?
  remarks               String?
  
  // Document management
  payslipUrl            String?
  payslipGeneratedAt    DateTime?
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@unique([employeeId, year, month])
  @@index([employeeId])
  @@index([year, month])
  @@index([status])
}
```

## Usage Examples

### Creating a Monthly Salary
```javascript
const salaryData = {
  year: 2024,
  month: 12,
  payPeriodStart: "2024-11-25T00:00:00.000Z",
  payPeriodEnd: "2024-12-25T00:00:00.000Z",
  paymentDate: "2025-01-06T00:00:00.000Z",
  basicSalary: 50000,
  hra: 20000,
  da: 5000,
  conveyanceAllowance: 1600,
  medicalAllowance: 1250,
  specialAllowance: 10000,
  providentFund: 6000,
  professionalTax: 200,
  tds: 5000,
  workingDays: 22,
  paidDays: 22,
  remarks: "December 2024 salary"
};

const monthlySalary = await salaryService.createMonthlySalary(employeeId, salaryData);
```

### Getting Salary Statistics
```javascript
const stats = await salaryService.getSalaryStatistics(2024, 12);
// Returns: { totalSalaries, totalAmount, averageSalary, pendingCount, approvedCount, paidCount }
```

### Approving a Salary
```javascript
const approvedSalary = await salaryService.approveMonthlySalary(
  salaryId, 
  "admin@example.com", 
  "Salary approved for December 2024"
);
```

## Error Handling

All service methods include proper error handling with descriptive error messages. Common errors include:

- `Monthly salary record not found`
- `Failed to create monthly salary`
- `Failed to update monthly salary`
- `Failed to approve monthly salary`

## Authentication

All salary endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Testing

Use the `salary.rest` file in the `api` folder to test all endpoints with example requests and responses. 