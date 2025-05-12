
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMockAuth } from "@/hooks/use-mock-auth";
import Image from "next/image";
import { BarChart, LineChart, PieChart, User, Building2, FolderKanban, ListTodo, BriefcaseBusiness, Receipt, Clock } from "lucide-react";
import { AdminAnalytics } from "@/components/dashboard/admin-analytics";
import { ManagerAnalytics } from "@/components/dashboard/manager-analytics";
import { HrAnalytics } from "@/components/dashboard/hr-analytics";
import { AccountsAnalytics } from "@/components/dashboard/accounts-analytics";
import { EmployeeAnalytics } from "@/components/dashboard/employee-analytics";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data - Replace with actual data fetching later
const mockData = {
  admin: {
    totalEmployees: 55,
    totalDepartments: 7,
    totalProjects: 12,
    totalTasks: 88,
    openJobs: 5,
    pendingReimbursements: 15,
    attendanceSummary: [
      { status: "Present", count: 850, fill: "hsl(var(--chart-1))" },
      { status: "Absent", count: 80, fill: "hsl(var(--chart-2))" },
      { status: "Leave", count: 70, fill: "hsl(var(--chart-3))" },
    ],
    headcountByDept: [
      { name: "Tech", value: 15, fill: "hsl(var(--chart-1))" },
      { name: "HR", value: 5, fill: "hsl(var(--chart-2))" },
      { name: "Sales", value: 10, fill: "hsl(var(--chart-3))" },
      { name: "Mktg", value: 8, fill: "hsl(var(--chart-4))" },
      { name: "Ops", value: 12, fill: "hsl(var(--chart-5))" },
      { name: "Design", value: 3, fill: "hsl(var(--chart-1))"},
      { name: "Finance", value: 2, fill: "hsl(var(--chart-2))"},
    ],
  },
  manager: {
    teamSize: 8,
    teamProjects: 3,
    teamTasksOpen: 12,
    teamAttendanceRate: 92, // Percentage
    pendingApprovals: 4, // Reimbursements or leave requests
     teamTaskStatus: [
        { status: 'To Do', count: 5, fill: 'hsl(var(--chart-1))' },
        { status: 'In Progress', count: 7, fill: 'hsl(var(--chart-2))' },
        { status: 'Completed', count: 15, fill: 'hsl(var(--chart-3))' },
        { status: 'Blocked', count: 1, fill: 'hsl(var(--chart-4))' },
    ],
    teamProjectStatus: [
        { status: 'Planning', count: 1, fill: 'hsl(var(--chart-5))' },
        { status: 'In Progress', count: 2, fill: 'hsl(var(--chart-1))' },
        { status: 'Completed', count: 4, fill: 'hsl(var(--chart-2))' },
    ],
  },
  hr: {
    activeEmployees: 50,
    newHiresThisMonth: 4,
    openPositions: 5,
    avgTimeToFill: 35, // days
    employeeDistribution: [ // Example: By Employment Type
      { type: "Full-time", count: 45, fill: "hsl(var(--chart-1))" },
      { type: "Part-time", count: 3, fill: "hsl(var(--chart-2))" },
      { type: "Intern", count: 2, fill: "hsl(var(--chart-3))" },
    ],
     jobStatusDistribution: [
        { status: 'Open', count: 5, fill: 'hsl(var(--chart-1))' },
        { status: 'Closed', count: 10, fill: 'hsl(var(--chart-2))' },
        { status: 'Filled', count: 8, fill: 'hsl(var(--chart-3))' },
        { status: 'Draft', count: 2, fill: 'hsl(var(--chart-4))' },
    ]
  },
  accounts: {
    totalPendingAmount: 1250.75,
    totalApprovedAmount: 8500.00,
    totalPaidAmount: 7800.50,
    pendingCount: 15,
    reimbursementTrend: [
      { month: "Jan", amount: 5000 },
      { month: "Feb", amount: 4500 },
      { month: "Mar", amount: 6200 },
      { month: "Apr", amount: 5800 },
      { month: "May", amount: 7100 },
      { month: "Jun", amount: 8500 },
    ],
     reimbursementStatusCounts: [
        { status: 'Pending', count: 15, fill: 'hsl(var(--chart-1))' },
        { status: 'Approved', count: 50, fill: 'hsl(var(--chart-2))' },
        { status: 'Rejected', count: 5, fill: 'hsl(var(--chart-3))' },
        { status: 'Paid', count: 45, fill: 'hsl(var(--chart-4))' },
    ],
  },
  employee: {
    presentDays: 18,
    absentDays: 1,
    leaveDays: 2,
    tasksToDo: 3,
    tasksInProgress: 2,
    tasksCompleted: 10,
    pendingReimbursementsCount: 2,
    pendingReimbursementsAmount: 95.50,
     attendanceSummary: [
        { status: 'Present', count: 18, fill: 'hsl(var(--chart-1))' },
        { status: 'Absent', count: 1, fill: 'hsl(var(--chart-2))' },
        { status: 'Leave', count: 2, fill: 'hsl(var(--chart-3))' },
    ],
    taskSummary: [
        { status: 'To Do', count: 3, fill: 'hsl(var(--chart-4))' },
        { status: 'In Progress', count: 2, fill: 'hsl(var(--chart-5))' },
        { status: 'Completed', count: 10, fill: 'hsl(var(--chart-1))' },
    ]
  }
};

export default function DashboardPage() {
  const { user, loading } = useMockAuth();

  if (loading || !user) {
    return (
      <div className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
      </div>
    );
  }

  const renderAnalytics = () => {
    switch (user.currentRole.value) {
      case 'superadmin':
      case 'admin': // Assuming admin has similar view to superadmin for now
        return <AdminAnalytics data={mockData.admin} />;
      case 'manager':
        return <ManagerAnalytics data={mockData.manager} />;
      case 'hr':
        return <HrAnalytics data={mockData.hr} />;
      case 'accounts':
        return <AccountsAnalytics data={mockData.accounts} />;
      case 'employee':
      default:
        return <EmployeeAnalytics data={mockData.employee} />;
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-l-4 border-primary">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome back, {user.name}!</CardTitle>
          <CardDescription>
            You are currently acting as <span className="font-semibold text-accent">{user.currentRole.name}</span>.
            Here's a quick overview of your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Can add a general message or quick link here */}
        </CardContent>
      </Card>

      {/* Role-Specific Analytics Section */}
      <div>
         <h2 className="text-2xl font-semibold mb-4 tracking-tight">Key Metrics & Analytics</h2>
         {renderAnalytics()}
      </div>

      {/* Optional: Generic Info/Spotlight Section */}
      <Card className="md:col-span-2 lg:col-span-1 border-t-4 border-secondary">
          <CardHeader>
              <CardTitle>Feature Spotlight</CardTitle>
          </CardHeader>
          <CardContent>
               <Image
                  src="https://picsum.photos/400/200?grayscale"
                  alt="Spotlight feature"
                  width={400}
                  height={200}
                  className="rounded-md object-cover w-full h-auto"
                  data-ai-hint="team collaboration meeting"
                />
              <p className="mt-3 text-sm text-muted-foreground">Discover the latest enhancements to streamline your workflow and boost productivity.</p>
          </CardContent>
      </Card>
    </div>
  );
}
