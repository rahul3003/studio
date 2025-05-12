"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ApplyLeaveDialog } from "@/components/profile/apply-leave-dialog";
import { useToast } from "@/hooks/use-toast";
import { useMockAuth } from "@/hooks/use-mock-auth";
import { CalendarCheck } from "lucide-react";

// Mock data relevant to this page
const mockAttendanceData = {
  summary: [
    { year: 2024, month: "July", present: 20, leaves: 1, sickLeaves: 0 },
    { year: 2024, month: "June", present: 22, leaves: 0, sickLeaves: 0 },
    { year: 2024, month: "May", present: 19, leaves: 2, sickLeaves: 1 },
  ],
   leaveBalance: {
      annual: 15,
      sick: 8,
      totalAnnual: 20,
      totalSick: 10,
    },
};

export default function MyAttendancePage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useMockAuth();
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = React.useState(false);

  if (authLoading || !user) {
    return <div>Loading attendance details...</div>;
  }

  const handleApplyLeave = (data) => {
    console.log("Leave application:", data);
    // Update mockAttendanceData or call an API
    toast({ title: "Leave Applied", description: `Your leave request from ${data.startDate} to ${data.endDate} has been submitted.` });
    setIsApplyLeaveOpen(false);
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl"><CalendarCheck /> My Attendance</CardTitle>
          <CardDescription>View your attendance summary and apply for leave.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Leave Balance</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <p><strong>Annual Leave:</strong> {mockAttendanceData.leaveBalance.annual} / {mockAttendanceData.leaveBalance.totalAnnual} days</p>
                <p><strong>Sick Leave:</strong> {mockAttendanceData.leaveBalance.sick} / {mockAttendanceData.leaveBalance.totalSick} days</p>
            </div>
          </div>
          
          <Button onClick={() => setIsApplyLeaveOpen(true)} className="mb-6">Apply for Leave</Button>
          
          <h3 className="font-semibold text-lg mb-2">Attendance Summary</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Leaves Taken</TableHead>
                <TableHead>Sick Leaves Taken</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAttendanceData.summary.map(item => (
                <TableRow key={`${item.year}-${item.month}`}>
                  <TableCell>{item.year}</TableCell>
                  <TableCell>{item.month}</TableCell>
                  <TableCell>{item.present}</TableCell>
                  <TableCell>{item.leaves}</TableCell>
                  <TableCell>{item.sickLeaves}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ApplyLeaveDialog isOpen={isApplyLeaveOpen} onClose={() => setIsApplyLeaveOpen(false)} onSubmit={handleApplyLeave} />
    </div>
  );
}
