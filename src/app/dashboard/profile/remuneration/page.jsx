"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { DollarSign } from "lucide-react";


export default function RemunerationPage() {
  const { user, loading: authLoading } = useAuthStore();
  const profileData = useProfileStore((state) => state.profileData);
  const initializeProfile = useProfileStore(state => state.initializeProfileForUser);
  
  React.useEffect(() => {
    if (user && (!profileData || profileData.personal.companyEmail !== user.email)) {
      initializeProfile(user);
    }
  }, [user, profileData, initializeProfile]);


  if (authLoading || !user || !profileData || !profileData.remuneration) {
    return <div>Loading remuneration details...</div>;
  }
  
  const remunerationData = profileData.remuneration;

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
              {remunerationData.payChanges.map(item => (
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
            <p><strong>Annual CTC (Cost to Company):</strong> {remunerationData.breakup.annualSalary}</p>
            <p><strong>Monthly Gross Salary:</strong> {remunerationData.breakup.monthlyGrossSalary}</p>
            <div className="pl-4 border-l-2 border-muted">
                <p className="font-medium mt-1">Deductions:</p>
                <ul className="list-disc list-inside ml-4 text-muted-foreground">
                    <li>Provident Fund (PF): {remunerationData.breakup.deductions.providentFund}</li>
                    <li>Professional Tax (PT): {remunerationData.breakup.deductions.professionalTax}</li>
                    <li>Income Tax (TDS): {remunerationData.breakup.deductions.incomeTax}</li>
                </ul>
            </div>
            <p className="font-semibold mt-2"><strong>Net Monthly Salary (Take Home):</strong> {remunerationData.breakup.netMonthlySalary}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
