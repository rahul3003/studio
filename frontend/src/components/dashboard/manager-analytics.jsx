
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Users, FolderKanban, ListTodo, Clock } from "lucide-react";
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
  Cell, // Added Cell import
} from "recharts";
import { Progress } from "@/components/ui/progress";

const taskChartConfig = {
  count: { label: "Tasks" },
  "To Do": { label: "To Do", color: "hsl(var(--chart-1))" },
  "In Progress": { label: "In Progress", color: "hsl(var(--chart-2))" },
  Completed: { label: "Completed", color: "hsl(var(--chart-3))" },
  Blocked: { label: "Blocked", color: "hsl(var(--chart-4))" },
};

const projectChartConfig = {
  count: { label: "Projects" },
  Planning: { label: "Planning", color: "hsl(var(--chart-5))" },
  "In Progress": { label: "In Progress", color: "hsl(var(--chart-1))" },
  Completed: { label: "Completed", color: "hsl(var(--chart-2))" },
};

export function ManagerAnalytics({ data }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Summary Cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Size</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.teamSize} Members</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Team Projects</CardTitle>
          <FolderKanban className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.teamProjects}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Team Tasks</CardTitle>
          <ListTodo className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.teamTasksOpen}</div>
        </CardContent>
      </Card>

      {/* Team Attendance Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Attendance Rate (Month)</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">{data.teamAttendanceRate}%</div>
          <Progress value={data.teamAttendanceRate} aria-label={`${data.teamAttendanceRate}% Attendance`} className="h-2" />
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
           <ListTodo className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.pendingApprovals}</div>
          <p className="text-xs text-muted-foreground">Reimbursements, Leave, etc.</p>
        </CardContent>
      </Card>


      {/* Team Task Status Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Team Task Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={taskChartConfig} className="h-[250px] w-full">
            <RechartsBarChart accessibilityLayer data={data.teamTaskStatus} layout="vertical" margin={{ right: 20 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                dataKey="status"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={80}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="count" layout="vertical" radius={4}>
                 {data.teamTaskStatus.map((entry) => (
                    <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                  ))}
              </Bar>
            </RechartsBarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
       {/* Team Project Status Chart - Example */}
        <Card>
            <CardHeader>
                <CardTitle>Team Project Status</CardTitle>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={projectChartConfig} className="h-[250px] w-full">
                    <RechartsBarChart accessibilityLayer data={data.teamProjectStatus} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid vertical={false}/>
                        <XAxis dataKey="status" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis/>
                        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                        <Bar dataKey="count" radius={4}>
                         {data.teamProjectStatus.map((entry) => (
                            <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                          ))}
                        </Bar>
                    </RechartsBarChart>
                </ChartContainer>
            </CardContent>
        </Card>

    </div>
  );
}

