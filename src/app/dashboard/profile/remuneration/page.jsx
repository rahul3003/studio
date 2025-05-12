"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useMockAuth } from "@/hooks/use-mock-auth";
import { DollarSign } from "lucide-react";

// Mock data relevant to this page
const mockRemunerationData = {
  payChanges: [
    { effectiveDate: "2024-01-01", percentageIncrease: "10%", salaryPostIncrease: "USD 95,000", reason: "Annual Performance Review" },
    { effectiveDate: "2023-01-01", percentageIncrease: "8%", salaryPostIncrease: "USD 86,363", reason: "Promotion to Senior" },
  ],
  breakup: {
    annualSalary: "USD 95,000",
    monthlySalary: "USD 7,916.67",
    taxDeduction: "10% (Approx. USD 791.67 monthly)",
  },
};

export default function RemunerationPage() {
  const { user, loading: authLoading } = useMockAuth();

  if (authLoading || !user) {
    return <div>Loading remuneration details...</div>;
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl"><DollarSign /> Remuneration Details</CardTitle>
          <CardDescription>View your pay change history and current salary breakup.</CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold text-lg mb-2">Pay Change History</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Effective Date</TableHead>
                <TableHead>% Increase</TableHead>
                <TableHead>Salary (Post Increase)</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRemunerationData.payChanges.map(item => (
                <TableRow key={item.effectiveDate}>
                  <TableCell>{new Date(item.effectiveDate).toLocaleDateString()}</TableCell>
                  <TableCell>{item.percentageIncrease}</TableCell>
                  <TableCell>{item.salaryPostIncrease}</TableCell>
                  <TableCell>{item.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator className="my-6" />
          <h3 className="font-semibold text-lg mb-2">Current Salary Breakup</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Annual Salary:</strong> {mockRemunerationData.breakup.annualSalary}</p>
            <p><strong>Monthly Salary:</strong> {mockRemunerationData.breakup.monthlySalary}</p>
            <p><strong>Tax Deduction:</strong> {mockRemunerationData.breakup.taxDeduction}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
