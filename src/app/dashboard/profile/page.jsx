"use client";

import * as React from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMockAuth } from "@/hooks/use-mock-auth";
import { ApplyLeaveDialog } from "@/components/profile/apply-leave-dialog";
import { NominateRewardDialog } from "@/components/profile/nominate-reward-dialog";
import { DownloadSalarySlipDialog } from "@/components/profile/download-salary-slip-dialog";
import { VerificationLetterDialog } from "@/components/profile/verification-letter-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

import {
  UserCircle2,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Briefcase,
  DollarSign,
  FileText,
  Award,
  Gift,
  History,
  LogOut,
  ShieldCheck,
  Eye,
  Download,
  Edit2,
  Paperclip
} from "lucide-react";

const mockProfileData = {
  primaryData: {
    phone: "+1 234 567 8900",
    address: "123 Innovation Drive, Tech City, TC 54321",
    profilePhoto: "https://i.pravatar.cc/150?u=profile",
    idProof: "ID_Proof_JohnDoe.pdf",
    addressProof: "Address_Proof_JohnDoe.pdf",
    joiningDate: "2022-08-15",
    department: "Technology",
  },
  secondaryData: {
    currentPosition: "Senior Software Engineer",
    currentRemuneration: "USD 95,000 per annum",
    leaveBalance: {
      annual: 15,
      sick: 8,
      totalAnnual: 20,
      totalSick: 10,
    },
    managerName: "Alice Wonderland",
    managerDepartment: "Technology",
  },
  rewards: {
    pointsAvailable: 1250,
    pointsReceived: 500,
    pointsValue: "USD 125.00", // Assuming 1 point = $0.10
    nominationHistory: [
      { id: 1, to: "Bob The Builder", points: 100, date: "2024-06-15", approvedBy: "Alice Wonderland", approvedOn: "2024-06-16", reason: "Excellent project management on Project X." },
      { id: 2, to: "Charlie Chaplin", points: 50, date: "2024-05-20", approvedBy: "Alice Wonderland", approvedOn: "2024-05-21", reason: "Great teamwork and UI designs." },
    ],
  },
  attendance: {
    summary: [
      { year: 2024, month: "July", present: 20, leaves: 1, sickLeaves: 0 },
      { year: 2024, month: "June", present: 22, leaves: 0, sickLeaves: 0 },
      { year: 2024, month: "May", present: 19, leaves: 2, sickLeaves: 1 },
    ],
  },
  remunerationHistory: {
    payChanges: [
      { effectiveDate: "2024-01-01", percentageIncrease: "10%", salaryPostIncrease: "USD 95,000", reason: "Annual Performance Review" },
      { effectiveDate: "2023-01-01", percentageIncrease: "8%", salaryPostIncrease: "USD 86,363", reason: "Promotion to Senior" },
    ],
    breakup: {
      annualSalary: "USD 95,000",
      monthlySalary: "USD 7,916.67",
      taxDeduction: "10% (Approx. USD 791.67 monthly)",
    },
  },
  reports: {
    ndaPath: "/documents/NDA_JohnDoe.pdf", // Mock path
    form16Path: "/documents/Form16_JohnDoe_2023.pdf", // Mock path
    digitalIdImage: "https://picsum.photos/300/180?random&blur=1&sig=digitalid"
  },
  holidays: [
    { date: "2024-01-01", name: "New Year's Day" },
    { date: "2024-01-26", name: "Republic Day" },
    { date: "2024-03-25", name: "Holi" },
    { date: "2024-04-09", name: "Ugadi" },
    { date: "2024-08-15", name: "Independence Day" },
    { date: "2024-10-02", name: "Gandhi Jayanti" },
    { date: "2024-10-31", name: "Diwali (Laxmi Pujan)" },
    { date: "2024-12-25", name: "Christmas" },
  ],
  restrictedHolidays: [
    { date: "2024-05-01", name: "May Day (RH)" },
    { date: "2024-09-07", name: "Ganesh Chaturthi (RH)" },
  ]
};

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useMockAuth();

  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = React.useState(false);
  const [isNominateRewardOpen, setIsNominateRewardOpen] = React.useState(false);
  const [isDownloadSalarySlipOpen, setIsDownloadSalarySlipOpen] = React.useState(false);
  const [isVerificationLetterOpen, setIsVerificationLetterOpen] = React.useState(false);

  if (authLoading || !user) {
    return <div>Loading profile...</div>; // Or a skeleton loader
  }

  const profilePhotoUrl = `https://i.pravatar.cc/150?u=${user.email}`; // Use email for consistent avatar

  const handleApplyLeave = (data) => {
    console.log("Leave application:", data);
    toast({ title: "Leave Applied", description: `Your leave request from ${data.startDate} to ${data.endDate} has been submitted.` });
    setIsApplyLeaveOpen(false);
  };

  const handleNominateReward = (data) => {
    console.log("Reward nomination:", data);
    toast({ title: "Nomination Submitted", description: `You have nominated ${data.nominee} for ${data.points} points.` });
    setIsNominateRewardOpen(false);
  };
  
  const handleDownloadSalarySlip = (data) => {
    console.log("Download salary slip for:", data);
    toast({ title: "Salary Slip Download", description: `Preparing salary slip for ${data.month} ${data.year}. (Mock download)` });
    setIsDownloadSalarySlipOpen(false);
  };

  const handleRequestVerificationLetter = (data) => {
    console.log("Verification letter request:", data);
    toast({ title: "Request Submitted", description: `Your request for a verification letter has been submitted. Purpose: ${data.purpose}` });
    setIsVerificationLetterOpen(false);
  };


  return (
    <div className="space-y-8 p-4 md:p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={profilePhotoUrl} alt={user.name} data-ai-hint="person face portrait" />
              <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl">{user.name}</CardTitle>
              <CardDescription className="text-md">{mockProfileData.secondaryData.currentPosition}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Primary Data Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><UserCircle2 /> Primary Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Email:</strong><span className="ml-2 text-muted-foreground">{user.email}</span></div>
          <div className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Phone:</strong><span className="ml-2 text-muted-foreground">{mockProfileData.primaryData.phone}</span></div>
          <div className="flex items-start col-span-1 md:col-span-2"><MapPin className="mr-2 mt-1 h-4 w-4 text-muted-foreground shrink-0" /><strong>Address:</strong><span className="ml-2 text-muted-foreground">{mockProfileData.primaryData.address}</span></div>
          <div className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Joining Date:</strong><span className="ml-2 text-muted-foreground">{new Date(mockProfileData.primaryData.joiningDate).toLocaleDateString()}</span></div>
          <div className="flex items-center"><Briefcase className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Department:</strong><span className="ml-2 text-muted-foreground">{mockProfileData.primaryData.department}</span></div>
          <div className="flex items-center"><Paperclip className="mr-2 h-4 w-4 text-muted-foreground" /><strong>ID Proof:</strong><Button variant="link" size="sm" className="p-0 h-auto ml-2 text-primary">{mockProfileData.primaryData.idProof}</Button></div>
          <div className="flex items-center"><Paperclip className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Address Proof:</strong><Button variant="link" size="sm" className="p-0 h-auto ml-2 text-primary">{mockProfileData.primaryData.addressProof}</Button></div>
        </CardContent>
      </Card>

      {/* Secondary Data Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><Briefcase /> Work Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div className="flex items-center"><strong>Current Position:</strong><span className="ml-2 text-muted-foreground">{mockProfileData.secondaryData.currentPosition}</span></div>
          <div className="flex items-center"><strong>Current Remuneration:</strong><span className="ml-2 text-muted-foreground">{mockProfileData.secondaryData.currentRemuneration}</span></div>
          <div>
            <strong>Leave Balance:</strong>
            <ul className="list-disc list-inside ml-2 mt-1 text-muted-foreground">
              <li>Annual: {mockProfileData.secondaryData.leaveBalance.annual} / {mockProfileData.secondaryData.leaveBalance.totalAnnual} days</li>
              <li>Sick: {mockProfileData.secondaryData.leaveBalance.sick} / {mockProfileData.secondaryData.totalSick} days</li>
            </ul>
          </div>
          <div className="flex items-center"><strong>Reporting Manager:</strong><span className="ml-2 text-muted-foreground">{mockProfileData.secondaryData.managerName} ({mockProfileData.secondaryData.managerDepartment})</span></div>
        </CardContent>
      </Card>

      {/* Rewards Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><Award /> Rewards Program</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="my_rewards">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="my_rewards">My Rewards</TabsTrigger>
              <TabsTrigger value="nominate">Nominate</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="my_rewards" className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <Card className="pt-6">
                  <CardTitle className="text-3xl">{mockProfileData.rewards.pointsAvailable}</CardTitle>
                  <CardDescription>Points Available</CardDescription>
                </Card>
                <Card className="pt-6">
                  <CardTitle className="text-3xl">{mockProfileData.rewards.pointsReceived}</CardTitle>
                  <CardDescription>Points Received (Lifetime)</CardDescription>
                </Card>
                <Card className="pt-6">
                  <CardTitle className="text-3xl">{mockProfileData.rewards.pointsValue}</CardTitle>
                  <CardDescription>Approx. Value</CardDescription>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="nominate" className="pt-4">
              <p className="text-sm text-muted-foreground mb-2">Recognize a colleague for their outstanding work.</p>
              <Button onClick={() => setIsNominateRewardOpen(true)}><Gift className="mr-2 h-4 w-4" /> Nominate Someone</Button>
            </TabsContent>
            <TabsContent value="history" className="pt-4">
              <h3 className="font-semibold mb-2">My Nomination History:</h3>
              {mockProfileData.rewards.nominationHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>To</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockProfileData.rewards.nominationHistory.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.to}</TableCell>
                        <TableCell>{item.points}</TableCell>
                        <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                        <TableCell className="max-w-xs truncate" title={item.reason}>{item.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (<p className="text-sm text-muted-foreground">You haven't nominated anyone yet.</p>)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Attendance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><CalendarCheck /> Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsApplyLeaveOpen(true)} className="mb-4">Apply for Leave</Button>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Leaves</TableHead>
                <TableHead>Sick Leaves</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProfileData.attendance.summary.map(item => (
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

      {/* Remuneration History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><DollarSign /> Remuneration</CardTitle>
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
              {mockProfileData.remunerationHistory.payChanges.map(item => (
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
            <p><strong>Annual Salary:</strong> {mockProfileData.remunerationHistory.breakup.annualSalary}</p>
            <p><strong>Monthly Salary:</strong> {mockProfileData.remunerationHistory.breakup.monthlySalary}</p>
            <p><strong>Tax Deduction:</strong> {mockProfileData.remunerationHistory.breakup.taxDeduction}</p>
          </div>
        </CardContent>
      </Card>

      {/* Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><FileText /> Reports & Documents</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button variant="outline" onClick={() => setIsDownloadSalarySlipOpen(true)}><Download className="mr-2 h-4 w-4" /> Download Salary Slip</Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline"><Eye className="mr-2 h-4 w-4" /> View NDA</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Non-Disclosure Agreement (NDA)</DialogTitle>
                <DialogDescription>This is a mock NDA document. In a real application, this would display the actual signed NDA.</DialogDescription>
              </DialogHeader>
              <div className="prose prose-sm max-w-none dark:prose-invert max-h-[60vh] overflow-y-auto p-1">
                <p><strong>NON-DISCLOSURE AGREEMENT</strong></p>
                <p>This Non-Disclosure Agreement (the &quot;Agreement&quot;) is entered into as of {new Date(mockProfileData.primaryData.joiningDate).toLocaleDateString()} by and between {user.name} (&quot;Employee&quot;) and {mockProfileData.primaryData.companyName || "PESU Venture Labs"} (&quot;Company&quot;).</p>
                <p>1. Confidential Information. &quot;Confidential Information&quot; means any information disclosed by Company to Employee, either directly or indirectly, in writing, orally or by inspection of tangible objects... (rest of mock NDA text)</p>
                <p>2. Obligations. Employee shall hold Confidential Information in strict confidence...</p>
                <p>...</p>
                <p>IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.</p>
                <div className="mt-8 flex justify-between">
                    <div>Signed: ____________________ ({user.name})</div>
                    <div>Signed: ____________________ (Company Representative)</div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={() => setIsVerificationLetterOpen(true)}><FileText className="mr-2 h-4 w-4" /> Apply for Verification Letter</Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline"><FileText className="mr-2 h-4 w-4" /> View Form 16</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Form 16 (Mock)</DialogTitle></DialogHeader>
              <p className="text-sm text-muted-foreground">Mock Form 16 for the latest financial year would be displayed here.</p>
              <Image src="https://picsum.photos/600/800?random&grayscale&blur=2&sig=form16" alt="Mock Form 16" width={600} height={800} className="rounded-md mt-2" data-ai-hint="tax form document" />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
               <Button variant="outline"><ShieldCheck className="mr-2 h-4 w-4" /> View Digital ID</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Digital Employee ID</DialogTitle></DialogHeader>
              <div className="flex flex-col items-center">
                <Image src={mockProfileData.reports.digitalIdImage} alt="Digital ID Card" width={300} height={180} className="rounded-lg border shadow-md" data-ai-hint="ID card employee" />
                <p className="mt-4 text-lg font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{mockProfileData.secondaryData.currentPosition}</p>
                <p className="text-xs text-muted-foreground">Employee ID: EMP{user.email.substring(0,3).toUpperCase()}001</p> {/* Mock ID */}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Holiday List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><CalendarDays /> Holiday List 2024</CardTitle>
        </CardHeader>
        <CardContent>
          <h4 className="font-semibold mb-2">Company Holidays:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {mockProfileData.holidays.map(holiday => (
              <li key={holiday.name}><span className="font-medium">{new Date(holiday.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}:</span> {holiday.name}</li>
            ))}
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Restricted Holidays (Choose any 2):</h4>
           <ul className="list-disc list-inside space-y-1 text-sm">
            {mockProfileData.restrictedHolidays.map(holiday => (
              <li key={holiday.name}><span className="font-medium">{new Date(holiday.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}:</span> {holiday.name}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ApplyLeaveDialog isOpen={isApplyLeaveOpen} onClose={() => setIsApplyLeaveOpen(false)} onSubmit={handleApplyLeave} />
      <NominateRewardDialog isOpen={isNominateRewardOpen} onClose={() => setIsNominateRewardOpen(false)} onSubmit={handleNominateReward} employeeList={initialEmployees.map(e => e.name).filter(name => name !== user.name)} />
      <DownloadSalarySlipDialog isOpen={isDownloadSalarySlipOpen} onClose={() => setIsDownloadSalarySlipOpen(false)} onSubmit={handleDownloadSalarySlip} />
      <VerificationLetterDialog isOpen={isVerificationLetterOpen} onClose={() => setIsVerificationLetterOpen(false)} onSubmit={handleRequestVerificationLetter} />
    </div>
  );
}

// Dummy data for NominateRewardDialog if `initialEmployees` is not directly accessible here or too large.
// This list is used for the dropdown in the NominateRewardDialog.
// Ensure it's available to the dialog component.
const initialEmployees = [
  { name: "Alice Wonderland" }, { name: "Bob The Builder" }, { name: "Charlie Chaplin" },
  { name: "Diana Prince" }, { name: "Edward Scissorhands" }, { name: "Fiona Gallagher" },
  { name: "George Best" }, { name: "Hannah Montana" }, { name: "Ian Wright" }, { name: "Julia Roberts" },
];