
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useMockAuth } from "@/hooks/use-mock-auth";
import { DollarSign } from "lucide-react";

// Mock data relevant to this page - Indian context
const mockRemunerationData = {
  payChanges: [
    { effectiveDate: "2024-04-01", percentageIncrease: "12%", salaryPostIncrease: "₹ 9,52,000 p.a.", reason: "Annual Performance Review" },
    { effectiveDate: "2023-04-01", percentageIncrease: "10%", salaryPostIncrease: "₹ 8,50,000 p.a.", reason: "Promotion to Senior Role" },
    { effectiveDate: "2022-08-15", percentageIncrease: "N/A (Joined)", salaryPostIncrease: "₹ 7,50,000 p.a.", reason: "Initial Offer" },
  ],
  breakup: {
    annualSalary: "₹ 9,52,000",
    monthlyGrossSalary: "₹ 79,333",
    deductions: {
        providentFund: "₹ 2,500 (Employee Contribution)",
        professionalTax: "₹ 200",
        incomeTax: "₹ 5,500 (Approx. TDS)",
    },
    netMonthlySalary: "₹ 71,133 (Approx.)",
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
                <TableHead>Salary (Post Change)</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRemunerationData.payChanges.map(item => (
                <TableRow key={item.effectiveDate}>
                  <TableCell>{new Date(item.effectiveDate).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell>{item.percentageIncrease}</TableCell>
                  <TableCell>{item.salaryPostIncrease}</TableCell>
                  <TableCell>{item.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator className="my-6" />
          <h3 className="font-semibold text-lg mb-2">Current Salary Breakup (Monthly)</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Annual CTC (Cost to Company):</strong> {mockRemunerationData.breakup.annualSalary}</p>
            <p><strong>Monthly Gross Salary:</strong> {mockRemunerationData.breakup.monthlyGrossSalary}</p>
            <div className="pl-4 border-l-2 border-muted">
                <p className="font-medium mt-1">Deductions:</p>
                <ul className="list-disc list-inside ml-4 text-muted-foreground">
                    <li>Provident Fund (PF): {mockRemunerationData.breakup.deductions.providentFund}</li>
                    <li>Professional Tax (PT): {mockRemunerationData.breakup.deductions.professionalTax}</li>
                    <li>Income Tax (TDS): {mockRemunerationData.breakup.deductions.incomeTax}</li>
                </ul>
            </div>
            <p className="font-semibold mt-2"><strong>Net Monthly Salary (Take Home):</strong> {mockRemunerationData.breakup.netMonthlySalary}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
