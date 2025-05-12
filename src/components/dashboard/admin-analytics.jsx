
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, PieChart, Users, Building, UsersRound, FolderKanban, Receipt, ListTodo, BriefcaseBusiness } from "lucide-react";
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
  BarChart as RechartsBarChart, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell,
} from "recharts";

// Config for department gender breakdown bar chart
const departmentGenderBarChartConfig = {
  Male: { label: "Male", color: "hsl(var(--chart-1))" },
  Female: { label: "Female", color: "hsl(var(--chart-2))" },
  Other: { label: "Other", color: "hsl(var(--chart-3))" },
};

// Config for overall gender distribution pie chart
const genderPieChartConfig = {
  count: { label: "Employees" },
  Male: { label: "Male", color: "hsl(var(--chart-1))" },
  Female: { label: "Female", color: "hsl(var(--chart-2))" },
  Other: { label: "Other", color: "hsl(var(--chart-3))" },
};

// Config for total headcount by department bar chart
const totalHeadcountBarConfig = {
  value: { label: "Total Headcount" },
  // fill colors are typically set per bar based on data or index
};


export function AdminAnalytics({ data }) {

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"> {/* Adjusted grid for potentially more cards */}
      {/* Summary Cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalEmployees}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalDepartments}</div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Job Positions</CardTitle>
           <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.openJobs}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <FolderKanban className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalProjects}</div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Reimbursements</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.pendingReimbursements}</div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks Assigned</CardTitle>
          <ListTodo className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalTasks}</div>
        </CardContent>
      </Card>

      {/* Department Headcount - Total */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Total Headcount by Department</CardTitle>
           <CardDescription>Total number of employees in each department.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={totalHeadcountBarConfig} className="h-[350px] w-full">
            <RechartsBarChart accessibilityLayer data={data.headcountByDept} margin={{ top: 5, right: 10, left: -10, bottom: 50 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3"/>
              <XAxis
                dataKey="name" // Department name
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                angle={-45}
                textAnchor="end"
                interval={0} // Show all labels
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false}/>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent 
                  formatter={(value, name, props) => [`${value} employees`, `Department: ${props.payload.name}`]}
                  indicator="dot" 
                  />}
              />
              <Bar dataKey="value" radius={4} name="Total Employees">
                 {data.headcountByDept.map((entry, index) => (
                  <Cell key={`cell-total-${index}`} fill={entry.fill || `hsl(var(--chart-${(index % 5) + 1}))`} />
                ))}
              </Bar>
            </RechartsBarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      {/* Department Headcount - Gender Breakdown */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Department Headcount by Gender</CardTitle>
          <CardDescription>Gender distribution within each department.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={departmentGenderBarChartConfig} className="h-[350px] w-full">
            <RechartsBarChart accessibilityLayer data={data.departmentGenderCounts} margin={{ top: 5, right: 10, left: -10, bottom: 50 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3"/>
              <XAxis
                dataKey="name" // Department name
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                angle={-45}
                textAnchor="end"
                interval={0} // Show all labels
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false}/>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <ChartLegend content={<ChartLegendContent icon={UsersRound} />} />
              <Bar dataKey="Male" stackId="a" fill={departmentGenderBarChartConfig.Male.color} radius={[4, 4, 0, 0]} name="Male" />
              <Bar dataKey="Female" stackId="a" fill={departmentGenderBarChartConfig.Female.color} name="Female" />
              <Bar dataKey="Other" stackId="a" fill={departmentGenderBarChartConfig.Other.color} radius={[0, 0, 4, 4]} name="Other" />
            </RechartsBarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Overall Gender Distribution */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Overall Gender Distribution</CardTitle>
          <CardDescription>Company-wide employee gender demographics.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <ChartContainer config={genderPieChartConfig} className="h-[350px] w-full">
            <RechartsPieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={data.genderDistribution}
                dataKey="count"
                nameKey="gender"
                innerRadius={80}
                outerRadius={120}
                strokeWidth={2}
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (
                    <text x={x} y={y} fill="hsl(var(--primary-foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-medium">
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                 {data.genderDistribution.map((entry) => (
                  <Cell key={`cell-gender-${entry.gender}`} fill={entry.fill} />
                ))}
              </Pie>
               <ChartLegend content={<ChartLegendContent nameKey="gender" icon={UsersRound} />} />
            </RechartsPieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

    