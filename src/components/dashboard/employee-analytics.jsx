
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo, CalendarCheck, Receipt, PieChart } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const attendanceConfig = {
  count: { label: "Days" },
  Present: { label: "Present", color: "hsl(var(--chart-1))" },
  Absent: { label: "Absent", color: "hsl(var(--chart-2))" },
  Leave: { label: "Leave", color: "hsl(var(--chart-3))" },
};

const taskConfig = {
  count: { label: "Tasks" },
  "To Do": { label: "To Do", color: "hsl(var(--chart-4))" },
  "In Progress": { label: "In Progress", color: "hsl(var(--chart-5))" },
  Completed: { label: "Completed", color: "hsl(var(--chart-1))" },
};

const formatCurrency = (value) => {
  // Basic currency formatting, adjust locale/currency symbol as needed
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};


export function EmployeeAnalytics({ data }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Task Summary Cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasks To Do</CardTitle>
          <ListTodo className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.tasksToDo}</div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasks In Progress</CardTitle>
          <ListTodo className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.tasksInProgress}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
          <ListTodo className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.tasksCompleted}</div>
        </CardContent>
      </Card>

      {/* Reimbursement Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Reimbursements</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.pendingReimbursementsCount}</div>
           <p className="text-xs text-muted-foreground">
            Totaling {formatCurrency(data.pendingReimbursementsAmount)}
          </p>
        </CardContent>
      </Card>


      {/* Attendance Summary Chart */}
      <Card>
        <CardHeader>
          <CardTitle>My Attendance (Month)</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <ChartContainer config={attendanceConfig} className="h-[200px] w-full">
            <RechartsPieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={data.attendanceSummary} dataKey="count" nameKey="status" innerRadius={50}>
                 {data.attendanceSummary.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
               <ChartLegend content={<ChartLegendContent nameKey="status" />} />
            </RechartsPieChart>
          </ChartContainer>
        </CardContent>
      </Card>

       {/* Task Status Chart */}
      <Card>
        <CardHeader>
          <CardTitle>My Task Status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <ChartContainer config={taskConfig} className="h-[200px] w-full">
            <RechartsPieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={data.taskSummary} dataKey="count" nameKey="status" outerRadius={70}>
                 {data.taskSummary.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="status" />} />
            </RechartsPieChart>
          </ChartContainer>
        </CardContent>
      </Card>

    </div>
  );
}
