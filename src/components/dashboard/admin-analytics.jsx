
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart as RechartsBarChart, // Alias import
  PieChart as RechartsPieChart, // Alias import
  Pie,
  Cell,
} from "recharts";

const barChartConfig = {
  value: { label: "Count" },
  Tech: { label: "Technology", color: "hsl(var(--chart-1))" },
  HR: { label: "Human Resources", color: "hsl(var(--chart-2))" },
  Sales: { label: "Sales", color: "hsl(var(--chart-3))" },
  Mktg: { label: "Marketing", color: "hsl(var(--chart-4))" },
  Ops: { label: "Operations", color: "hsl(var(--chart-5))" },
  Design: { label: "Design", color: "hsl(var(--chart-1))" }, // Re-use colors
  Finance: { label: "Finance", color: "hsl(var(--chart-2))" }, // Re-use colors
};

const pieChartConfig = {
  count: { label: "Count" },
  Present: { label: "Present", color: "hsl(var(--chart-1))" },
  Absent: { label: "Absent", color: "hsl(var(--chart-2))" },
  Leave: { label: "Leave", color: "hsl(var(--chart-3))" },
};

export function AdminAnalytics({ data }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Summary Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Total Employees</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">{data.totalEmployees}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">{data.totalDepartments}</CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Open Job Positions</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">{data.openJobs}</CardContent>
      </Card>

      {/* Headcount by Department Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Headcount by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barChartConfig} className="h-[300px] w-full">
            <RechartsBarChart accessibilityLayer data={data.headcountByDept} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3"/>
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8}/>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="value" radius={4} />
            </RechartsBarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Attendance Summary Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Overview (Sample)</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <ChartContainer config={pieChartConfig} className="h-[250px] w-full">
            <RechartsPieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={data.attendanceSummary}
                dataKey="count"
                nameKey="status"
                innerRadius={60}
                outerRadius={90}
                strokeWidth={2}
              >
                 {data.attendanceSummary.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
               <ChartLegend content={<ChartLegendContent nameKey="status" />} />
            </RechartsPieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* More summary cards */}
      <Card>
        <CardHeader>
          <CardTitle>Active Projects</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">{data.totalProjects}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pending Reimbursements</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">{data.pendingReimbursements}</CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Total Tasks</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">{data.totalTasks}</CardContent>
      </Card>

    </div>
  );
}
