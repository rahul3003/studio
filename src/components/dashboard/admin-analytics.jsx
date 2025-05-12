
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, PieChart, Users, Building, UsersRound, FolderKanban, Receipt, ListTodo } from "lucide-react"; // Added FolderKanban, Receipt, ListTodo
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const barChartConfig = {
  value: { label: "Headcount" },
  // Department specific labels will be derived from data
};

const genderPieChartConfig = {
  count: { label: "Employees" },
  Male: { label: "Male", color: "hsl(var(--chart-1))" },
  Female: { label: "Female", color: "hsl(var(--chart-2))" },
  Other: { label: "Other", color: "hsl(var(--chart-3))" },
};

export function AdminAnalytics({ data }) {
  const [analyticsView, setAnalyticsView] = React.useState("departments"); // 'departments' or 'gender'

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
           <BarChart className="h-4 w-4 text-muted-foreground" /> {/* Changed icon */}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.openJobs}</div>
        </CardContent>
      </Card>

      {/* Analytics View Switcher */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Employee Demographics</CardTitle>
          <CardDescription>View employee distribution by department or gender.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="analytics-view-select" className="text-sm font-medium">Select View:</Label>
            <Select value={analyticsView} onValueChange={setAnalyticsView}>
              <SelectTrigger id="analytics-view-select" className="w-full md:w-[200px] mt-1">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="departments">By Department</SelectItem>
                <SelectItem value="gender">By Gender</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {analyticsView === "departments" && (
            <ChartContainer config={barChartConfig} className="h-[350px] w-full">
              <RechartsBarChart accessibilityLayer data={data.headcountByDept} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3"/>
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false}/>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent 
                    formatter={(value, name, props) => {
                        const dept = data.headcountByDept.find(d => d.name === props.payload.name);
                        return [`${value} employees`, dept ? `Department: ${dept.name}`: "Department"];
                    }}
                    indicator="dot" 
                    />}
                />
                 <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="value" radius={4} name="Headcount">
                   {data.headcountByDept.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ChartContainer>
          )}

          {analyticsView === "gender" && (
            <ChartContainer config={genderPieChartConfig} className="h-[350px] w-full flex items-center justify-center">
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
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, ...rest }) => {
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
                    <Cell key={`cell-${entry.gender}`} fill={entry.fill} />
                  ))}
                </Pie>
                 <ChartLegend content={<ChartLegendContent nameKey="gender" icon={UsersRound} />} />
              </RechartsPieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>


      {/* More summary cards can remain below or be integrated elsewhere */}
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

    </div>
  );
}

