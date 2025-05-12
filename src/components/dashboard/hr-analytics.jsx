
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BriefcaseBusiness, Clock, PieChart } from "lucide-react";
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

const employmentTypeConfig = {
  count: { label: "Employees" },
  "Full-time": { label: "Full-time", color: "hsl(var(--chart-1))" },
  "Part-time": { label: "Part-time", color: "hsl(var(--chart-2))" },
  Intern: { label: "Intern", color: "hsl(var(--chart-3))" },
};

const jobStatusConfig = {
  count: { label: "Jobs" },
  Open: { label: "Open", color: "hsl(var(--chart-1))" },
  Closed: { label: "Closed", color: "hsl(var(--chart-2))" },
  Filled: { label: "Filled", color: "hsl(var(--chart-3))" },
  Draft: { label: "Draft", color: "hsl(var(--chart-4))" },
};


export function HrAnalytics({ data }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Summary Cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.activeEmployees}</div>
           <p className="text-xs text-muted-foreground">
            +{data.newHiresThisMonth} new hires this month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
          <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.openPositions}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Time to Fill (Mock)</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.avgTimeToFill} Days</div>
        </CardContent>
      </Card>

      {/* Employee Distribution Chart */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Employee Distribution</CardTitle>
           <CardDescription>By Employment Type</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <ChartContainer config={employmentTypeConfig} className="h-[250px] w-full">
            <RechartsPieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={data.employeeDistribution} dataKey="count" nameKey="type" innerRadius={50}>
                 {data.employeeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
               <ChartLegend content={<ChartLegendContent nameKey="type" />} />
            </RechartsPieChart>
          </ChartContainer>
        </CardContent>
      </Card>

       {/* Job Status Distribution Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Job Posting Status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <ChartContainer config={jobStatusConfig} className="h-[250px] w-full">
            <RechartsPieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={data.jobStatusDistribution} dataKey="count" nameKey="status" outerRadius={90} >
                 {data.jobStatusDistribution.map((entry, index) => (
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
