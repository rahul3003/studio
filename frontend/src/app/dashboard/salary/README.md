# Salary Management Page

## Overview
The Salary Management page is a comprehensive dashboard for managing employee salaries, approvals, and payroll processing. It's accessible at `/dashboard/salary` and provides real-time data from the database.

## Features

### 1. Overview Tab
- **Statistics Cards**: Total payroll, employee count, pending approvals, average salary
- **Recent Activity**: Latest salary processing and approval activities
- **Real-time Data**: All data is fetched from the database in real-time

### 2. Salary Records Tab
- **Complete Table**: View all salary records with employee details
- **Status Management**: Approve/Reject pending salaries (for authorized roles)
- **Filtering**: Can be extended with filters for year, month, status, department
- **Actions**: View details, approve, reject buttons for each record

### 3. Reports Tab
- **Department Distribution**: Visual progress bars showing salary distribution across departments
- **Monthly Trends**: 6-month salary trend analysis
- **Interactive Charts**: Progress bars and trend indicators

### 4. Settings Tab
- **Configuration Options**: Auto-approval threshold, pay day settings
- **Notification Settings**: Email notification preferences
- **Workflow Management**: Approval process configuration

## Access Control
- **SUPERADMIN**: Full access to all features
- **ADMIN**: Full access to all features
- **MANAGER**: Can view and manage team salaries
- **HR**: Can view and manage all salaries
- **ACCOUNTS**: Primary access for salary management
- **EMPLOYEE**: No access (redirected to profile remuneration)

## Data Sources
- **Backend API**: `/api/salaries/monthly-salaries`
- **Statistics API**: `/api/salaries/monthly-salaries/statistics`
- **Real-time Updates**: Data refreshes automatically

## Key Components
- **useSalaryStore**: Zustand store for state management
- **salaryService**: API service for backend communication
- **Real-time Statistics**: Live dashboard metrics
- **Status Badges**: Color-coded status indicators
- **Currency Formatting**: Indian Rupee format

## Navigation
The page is accessible from the sidebar under "Salary Management" with a CreditCard icon.

## Database Integration
- **MonthlySalary Model**: Complete salary records with all components
- **Employee Relations**: Linked to employee and department data
- **Status Tracking**: PENDING, APPROVED, REJECTED, PAID statuses
- **Audit Trail**: Approval/rejection timestamps and user tracking 