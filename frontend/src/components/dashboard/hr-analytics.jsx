
"use client";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BriefcaseBusiness, Clock, PieChart, Building, UsersRound } from "lucide-react";
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
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const genderPieChartConfig = {
  count: { label: "Employees" },
  Male: { label: "Male", color: "hsl(var(--chart-1))" },
  Female: { label: "Female", color: "hsl(var(--chart-2))" },
  Other: { label: "Other", color: "hsl(var(--chart-3))" },
};

const deptBarChartConfig = {
  value: { label: "Headcount" },
};

const jobStatusConfig = {
  count: { label: "Jobs" },
  Open: { label: "Open", color: "hsl(var(--chart-1))" },
  Closed: { label: "Closed", color: "hsl(var(--chart-2))" },
  Filled: { label: "Filled", color: "hsl(var(--chart-3))" },
  Draft: { label: "Draft", color: "hsl(var(--chart-4))" },
};


export function HrAnalytics({ data }) {
  const [analyticsView, setAnalyticsView] = React.useState("departments"); // 'departments' or 'gender'

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
      
      {/* Employee Demographics Section */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Employee Demographics</CardTitle>
          <CardDescription>View employee distribution by department or gender.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="hr-analytics-view-select" className="text-sm font-medium">Select View:</Label>
            <Select value={analyticsView} onValueChange={setAnalyticsView}>
              <SelectTrigger id="hr-analytics-view-select" className="w-full md:w-[200px] mt-1">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="departments">By Department</SelectItem>
                <SelectItem value="gender">By Gender</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {analyticsView === "departments" && (
             <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Headcount by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={deptBarChartConfig} className="h-[300px] w-full">
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
                            return [`${value} employees`, dept ? `Department: ${dept.name}` : "Department"];
                        }}
                        indicator="dot" 
                        />}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="value" radius={4} name="Headcount">
                      {data.headcountByDept.map((entry) => (
                        <Cell key={`cell-dept-${entry.name}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {analyticsView === "gender" && (
             <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="text-lg">Gender Distribution</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                    <ChartContainer config={genderPieChartConfig} className="h-[300px] w-full">
                        <RechartsPieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={data.employeeDistribution} // This is already gender distribution in HR mock data
                            dataKey="count"
                            nameKey="gender" // Use 'gender' as nameKey if data.employeeDistribution is gender data
                            innerRadius={60}
                            outerRadius={100}
                            strokeWidth={2}
                             labelLine={false}
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent}) => {
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
                            {data.employeeDistribution.map((entry) => (
                            <Cell key={`cell-gender-${entry.gender}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent nameKey="gender" icon={UsersRound} />} /> 
                        </RechartsPieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>


       {/* Job Status Distribution Chart */}
      <Card className="lg:col-span-3"> {/* Make it full width for better visibility */}
        <CardHeader>
          <CardTitle>Job Posting Status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <ChartContainer config={jobStatusConfig} className="h-[300px] w-full">
            <RechartsPieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={data.jobStatusDistribution} dataKey="count" nameKey="status" outerRadius={100} >
                 {data.jobStatusDistribution.map((entry, index) => (
                  <Cell key={`cell-job-${index}`} fill={entry.fill} />
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

