
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, BarChart, DollarSign, CheckCircle, Send } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  Bar,
  Cell
} from "recharts";

const lineChartConfig = {
  amount: { label: "Amount (USD)", color: "hsl(var(--chart-1))" },
};

const barChartConfig = {
  count: { label: "Count" },
  Pending: { label: "Pending", color: "hsl(var(--chart-1))" },
  Approved: { label: "Approved", color: "hsl(var(--chart-2))" },
  Rejected: { label: "Rejected", color: "hsl(var(--chart-3))" },
  Paid: { label: "Paid", color: "hsl(var(--chart-4))" },
};

const formatCurrency = (value) => {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};


export function AccountsAnalytics({ data }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Summary Cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Reimbursements</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.totalPendingAmount)}</div>
          <p className="text-xs text-muted-foreground">{data.pendingCount} claims</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved (Last 6 Months)</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.totalApprovedAmount)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Paid (Last 6 Months)</CardTitle>
          <Send className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.totalPaidAmount)}</div>
        </CardContent>
      </Card>

      {/* Reimbursement Trend Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Reimbursement Amounts Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={lineChartConfig} className="h-[300px] w-full">
            <RechartsLineChart
              accessibilityLayer
              data={data.reimbursementTrend}
              margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <ChartTooltip
                 cursor={false}
                 content={
                   <ChartTooltipContent
                     indicator="line"
                     labelFormatter={(value, payload) => `Month: ${payload[0]?.payload?.month}`}
                     formatter={(value) => formatCurrency(value)}
                   />
                 }
              />
              <Line
                dataKey="amount"
                type="monotone"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={true}
              />
            </RechartsLineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Reimbursement Status Counts Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Reimbursement Status Counts</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barChartConfig} className="h-[300px] w-full">
            <RechartsBarChart accessibilityLayer data={data.reimbursementStatusCounts} margin={{ top: 5, right: 0, left: -10, bottom: 5 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="status"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                angle={-45} textAnchor="end" height={50}
              />
               <YAxis tickLine={false} axisLine={false} tickMargin={8}/>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="count" radius={4}>
                 {data.reimbursementStatusCounts.map((entry) => (
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
