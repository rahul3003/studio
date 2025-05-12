
"use client";

import * as React from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMockAuth } from "@/hooks/use-mock-auth";
import { PersonalInformationEditDialog } from "@/components/profile/personal-information-edit-dialog";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApplyLeaveDialog } from "@/components/profile/apply-leave-dialog";
import { NominateRewardDialog } from "@/components/profile/nominate-reward-dialog";
import { DownloadSalarySlipDialog } from "@/components/profile/download-salary-slip-dialog";
import { VerificationLetterDialog } from "@/components/profile/verification-letter-dialog";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  UserCircle2,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Briefcase,
  Paperclip,
  Building,
  Edit3,
  Award,
  DollarSign,
  FileText as FileTextIcon, // Renamed to avoid conflict with React's FileText
  Eye,
  ShieldCheck,
  Download,
  CalendarCheck,
  Gift
} from "lucide-react";

const initialMockProfileData = {
  personal: {
    name: "Priya Sharma",
    phone: "+91 98765 43210",
    address: "Apt 101, Silicon Towers, Koramangala, Bengaluru, Karnataka 560034",
    companyEmail: "priya.sharma@pesuventurelabs.com",
    personalEmail: "priya.personal@example.com",
    profilePhotoUrl: "https://i.pravatar.cc/150?u=priya.sharma",
    profilePhotoFileName: "", // For "uploaded" photo name
    idProofFileName: "Aadhaar_PriyaSharma.pdf",
    addressProofFileName: "ElectricityBill_PriyaSharma.pdf",
    city: "Bengaluru"
  },
  secondaryData: {
    joiningDate: "2022-08-15",
    department: "Technology",
    currentPosition: "Senior Software Engineer",
    currentRemuneration: "₹ 9,52,000 p.a.",
    leaveBalance: { annual: 15, sick: 8, totalAnnual: 20, totalSick: 10 },
    managerName: "Rohan Mehra",
    managerDepartment: "Technology",
  },
  rewards: {
    pointsAvailable: 1250,
    pointsReceived: 500,
    pointsValue: "₹ 125.00",
    nominationHistory: [
      { id: 1, to: "Rohan Mehra", points: 100, date: "2024-06-15", approvedBy: "Priya Sharma", approvedOn: "2024-06-16", reason: "Excellent project management on HRMS portal." },
    ],
  },
  attendance: {
    summary: [
      { year: 2024, month: "July", present: 20, leaves: 1, sickLeaves: 0 },
      { year: 2024, month: "June", present: 22, leaves: 0, sickLeaves: 0 },
    ],
  },
  remuneration: {
    payChanges: [
      { effectiveDate: "2024-04-01", percentageIncrease: "12%", salaryPostIncrease: "₹ 9,52,000 p.a.", reason: "Annual Performance Review" },
      { effectiveDate: "2023-04-01", percentageIncrease: "10%", salaryPostIncrease: "₹ 8,50,000 p.a.", reason: "Promotion to Senior Role" },
    ],
    breakup: {
      annualSalary: "₹ 9,52,000",
      monthlyGrossSalary: "₹ 79,333",
      deductions: { providentFund: "₹ 2,500", professionalTax: "₹ 200", incomeTax: "₹ 5,500 (Approx. TDS)" },
      netMonthlySalary: "₹ 71,133 (Approx.)",
    },
  },
  reports: {
    ndaPath: "/documents/NDA_JohnDoe.pdf",
    form16Path: "/documents/Form16_JohnDoe_2023.pdf",
    digitalIdImage: "https://www.pesuventurelabs.com/static/media/PVL%20Logo.9cc047dd.png", 
  },
  holidays: {
    companyHolidays: [
      { date: "2024-01-01", name: "New Year's Day" },
      { date: "2024-01-26", name: "Republic Day" },
      { date: "2024-08-15", name: "Independence Day" },
      { date: "2024-10-02", name: "Gandhi Jayanti" },
      { date: "2024-10-31", name: "Diwali" },
      { date: "2024-12-25", name: "Christmas" },
    ],
    restrictedHolidays: [
      { date: "2024-03-25", name: "Holi (RH)" },
      { date: "2024-09-07", name: "Ganesh Chaturthi (RH)" },
    ]
  },
  companyName: "PESU Venture Labs"
};

// Dummy employee list for nomination dialog
const DUMMY_EMPLOYEE_LIST = [
  { name: "Priya Sharma" }, { name: "Rohan Mehra" }, { name: "Aisha Khan" },
  { name: "Vikram Singh" }, { name: "Suresh Kumar" }, { name: "Sunita Reddy" },
];

export default function ProfilePage() {
  const { user, loading: authLoading } = useMockAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = React.useState(initialMockProfileData);

  const [isEditPersonalOpen, setIsEditPersonalOpen] = React.useState(false);
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = React.useState(false);
  const [isNominateRewardOpen, setIsNominateRewardOpen] = React.useState(false);
  const [isDownloadSalarySlipOpen, setIsDownloadSalarySlipOpen] = React.useState(false);
  const [isVerificationLetterOpen, setIsVerificationLetterOpen] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      // Simulate fetching more complete profile data for the logged-in user
      // In a real app, this would be an API call based on user.id or email
      const userSpecificData = {
        ...initialMockProfileData, // Start with base mock
        personal: {
          ...initialMockProfileData.personal,
          name: user.name,
          companyEmail: user.email,
          profilePhotoUrl: user.avatar || initialMockProfileData.personal.profilePhotoUrl,
          // Assume other personal details might be specific for a real fetch
          phone: user.name === "Priya Sharma" ? "+91 98765 43210" : "+91 88888 77777", 
          address: user.name === "Priya Sharma" ? "Apt 101, Silicon Towers, Koramangala, Bengaluru, Karnataka 560034" : "B-45, Green Park, New Delhi 110016",
          city: user.name === "Priya Sharma" ? "Bengaluru" : "New Delhi",
          idProofFileName: user.name === "Priya Sharma" ? "Aadhaar_PriyaSharma.pdf" : "PAN_Card_RohanMehra.pdf",
          addressProofFileName: user.name === "Priya Sharma" ? "ElectricityBill_PriyaSharma.pdf" : "Passport_RohanMehra.pdf",
        },
        secondaryData: {
            ...initialMockProfileData.secondaryData,
            currentPosition: user.currentRole?.name === "Employee" ? "Software Engineer" : user.currentRole?.name || "Employee", // Adjust based on actual role if needed
            managerName: user.name === "Priya Sharma" ? "Rohan Mehra" : "Anita Singh"
        }
      };
      setProfileData(userSpecificData);
    }
  }, [user]);

  if (authLoading || !user) {
    return <div>Loading profile...</div>;
  }

  const handleSavePersonalInformation = (data) => {
    setProfileData(prevData => ({
      ...prevData,
      personal: {
        ...prevData.personal,
        name: data.name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        personalEmail: data.personalEmail,
        profilePhotoUrl: data.profilePhotoUrl || prevData.personal.profilePhotoUrl, // Keep old if new is empty
        profilePhotoFileName: data.profilePhotoFileName || prevData.personal.profilePhotoFileName,
        idProofFileName: data.idProofFileName || prevData.personal.idProofFileName,
        addressProofFileName: data.addressProofFileName || prevData.personal.addressProofFileName,
      }
    }));
    toast({ title: "Personal Information Updated", description: "Your details have been saved." });
    setIsEditPersonalOpen(false);
  };

  const handleApplyLeave = (data) => {
    console.log("Leave application:", data);
    toast({ title: "Leave Applied", description: `Your leave request from ${data.startDate} to ${data.endDate} has been submitted.` });
    setIsApplyLeaveOpen(false);
  };

  const handleNominateReward = (data) => {
    console.log("Reward nomination:", data);
    const newNomination = {
        id: profileData.rewards.nominationHistory.length + 1,
        to: data.nominee,
        points: data.points,
        date: new Date().toISOString().split('T')[0],
        approvedBy: user.name, // Self-approved for mock
        approvedOn: new Date().toISOString().split('T')[0],
        reason: data.reason,
    };
    setProfileData(prev => ({
        ...prev,
        rewards: {
            ...prev.rewards,
            nominationHistory: [newNomination, ...prev.rewards.nominationHistory]
        }
    }));
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
  
  const availableEmployeesForNomination = DUMMY_EMPLOYEE_LIST
    .map(e => e.name)
    .filter(name => name !== user.name);

  return (
    <div className="space-y-8 p-4 md:p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={profileData.personal.profilePhotoUrl} alt={profileData.personal.name} data-ai-hint="person face portrait"/>
              <AvatarFallback>{profileData.personal.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl">{profileData.personal.name}</CardTitle>
              <CardDescription className="text-md">{profileData.secondaryData.currentPosition} at {profileData.companyName}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-xl"><UserCircle2 /> Primary Data</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsEditPersonalOpen(true)}>
            <Edit3 className="mr-2 h-4 w-4" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Company Email:</strong><span className="ml-2 text-muted-foreground">{profileData.personal.companyEmail}</span></div>
          <div className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Personal Email:</strong><span className="ml-2 text-muted-foreground">{profileData.personal.personalEmail || "N/A"}</span></div>
          <div className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Phone:</strong><span className="ml-2 text-muted-foreground">{profileData.personal.phone}</span></div>
          <div className="flex items-start col-span-1 md:col-span-2"><MapPin className="mr-2 mt-1 h-4 w-4 text-muted-foreground shrink-0" /><strong>Address:</strong><span className="ml-2 text-muted-foreground">{profileData.personal.address}</span></div>
          <div className="flex items-center"><Paperclip className="mr-2 h-4 w-4 text-muted-foreground" /><strong>ID Proof:</strong><span className="ml-2 text-primary cursor-pointer hover:underline">{profileData.personal.idProofFileName || "Not Uploaded"}</span></div>
          <div className="flex items-center"><Paperclip className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Address Proof:</strong><span className="ml-2 text-primary cursor-pointer hover:underline">{profileData.personal.addressProofFileName || "Not Uploaded"}</span></div>
           {profileData.personal.profilePhotoFileName && <div className="flex items-center"><Paperclip className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Profile Photo File:</strong><span className="ml-2 text-primary">{profileData.personal.profilePhotoFileName}</span></div>}
          <div className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" /><strong>City:</strong><span className="ml-2 text-muted-foreground">{profileData.personal.city || "N/A"}</span></div>
          <div className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Joining Date:</strong><span className="ml-2 text-muted-foreground">{new Date(profileData.secondaryData.joiningDate).toLocaleDateString('en-IN')}</span></div>
          <div className="flex items-center"><Building className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Department:</strong><span className="ml-2 text-muted-foreground">{profileData.secondaryData.department}</span></div>
        </CardContent>
      </Card>

      {/* Secondary Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><Briefcase /> Secondary Data</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div className="flex items-center"><strong>Current Position:</strong><span className="ml-2 text-muted-foreground">{profileData.secondaryData.currentPosition}</span></div>
          <div className="flex items-center"><DollarSign className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Remuneration:</strong><span className="ml-2 text-muted-foreground">{profileData.secondaryData.currentRemuneration}</span></div>
          <div className="flex items-center"><strong>Annual Leave Balance:</strong><span className="ml-2 text-muted-foreground">{profileData.secondaryData.leaveBalance.annual} / {profileData.secondaryData.leaveBalance.totalAnnual} days</span></div>
          <div className="flex items-center"><strong>Sick Leave Balance:</strong><span className="ml-2 text-muted-foreground">{profileData.secondaryData.leaveBalance.sick} / {profileData.secondaryData.leaveBalance.totalSick} days</span></div>
          <div className="flex items-center"><strong>Manager:</strong><span className="ml-2 text-muted-foreground">{profileData.secondaryData.managerName} ({profileData.secondaryData.managerDepartment})</span></div>
        </CardContent>
      </Card>

      {/* Rewards Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><Award /> Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-6">
            <Card className="pt-4 pb-3 shadow-sm">
              <CardTitle className="text-2xl">{profileData.rewards.pointsAvailable}</CardTitle>
              <CardDescription>Points Available</CardDescription>
            </Card>
            <Card className="pt-4 pb-3 shadow-sm">
              <CardTitle className="text-2xl">{profileData.rewards.pointsReceived}</CardTitle>
              <CardDescription>Points Received</CardDescription>
            </Card>
            <Card className="pt-4 pb-3 shadow-sm">
              <CardTitle className="text-2xl">{profileData.rewards.pointsValue}</CardTitle>
              <CardDescription>Approx. Value</CardDescription>
            </Card>
          </div>
          <Button onClick={() => setIsNominateRewardOpen(true)} className="mb-4"><Gift className="mr-2 h-4 w-4" /> Nominate for Reward</Button>
          <h4 className="font-semibold text-md mb-2 mt-2">My Nomination History:</h4>
          {profileData.rewards.nominationHistory.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>To</TableHead><TableHead>Points</TableHead><TableHead>Date</TableHead><TableHead>Approved By</TableHead><TableHead>Approved On</TableHead><TableHead>Reason</TableHead></TableRow></TableHeader>
              <TableBody>
                {profileData.rewards.nominationHistory.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.to}</TableCell><TableCell>{item.points}</TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>{item.approvedBy}</TableCell>
                    <TableCell>{new Date(item.approvedOn).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell className="max-w-xs truncate" title={item.reason}>{item.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (<p className="text-sm text-muted-foreground">No nominations made yet.</p>)}
        </CardContent>
      </Card>

      {/* Attendance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><CalendarCheck /> Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsApplyLeaveOpen(true)} className="mb-4">Apply for Leave</Button>
          <h4 className="font-semibold text-md mb-2">Attendance Summary:</h4>
          <Table>
            <TableHeader><TableRow><TableHead>Year</TableHead><TableHead>Month</TableHead><TableHead>Present</TableHead><TableHead>Leaves</TableHead><TableHead>Sick Leaves</TableHead></TableRow></TableHeader>
            <TableBody>
              {profileData.attendance.summary.map(item => (
                <TableRow key={`${item.year}-${item.month}`}>
                  <TableCell>{item.year}</TableCell><TableCell>{item.month}</TableCell>
                  <TableCell>{item.present}</TableCell><TableCell>{item.leaves}</TableCell><TableCell>{item.sickLeaves}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Remuneration History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><DollarSign /> Remuneration History</CardTitle>
        </CardHeader>
        <CardContent>
          <h4 className="font-semibold text-md mb-2">Pay Change History:</h4>
          <Table>
            <TableHeader><TableRow><TableHead>Effective Date</TableHead><TableHead>% Increase</TableHead><TableHead>Salary (Post Change)</TableHead><TableHead>Reason</TableHead></TableRow></TableHeader>
            <TableBody>
              {profileData.remuneration.payChanges.map(item => (
                <TableRow key={item.effectiveDate}>
                  <TableCell>{new Date(item.effectiveDate).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell>{item.percentageIncrease}</TableCell><TableCell>{item.salaryPostIncrease}</TableCell><TableCell>{item.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator className="my-6" />
          <h4 className="font-semibold text-md mb-2">Current Salary Breakup (Monthly):</h4>
          <div className="space-y-1 text-sm">
            <p><strong>Annual CTC:</strong> {profileData.remuneration.breakup.annualSalary}</p>
            <p><strong>Monthly Gross:</strong> {profileData.remuneration.breakup.monthlyGrossSalary}</p>
            <div className="pl-4"><p className="font-medium">Deductions:</p>
                <ul className="list-disc list-inside ml-4 text-muted-foreground">
                    <li>PF: {profileData.remuneration.breakup.deductions.providentFund}</li>
                    <li>PT: {profileData.remuneration.breakup.deductions.professionalTax}</li>
                    <li>TDS: {profileData.remuneration.breakup.deductions.incomeTax}</li>
                </ul>
            </div>
            <p className="font-semibold mt-1"><strong>Net Monthly Salary:</strong> {profileData.remuneration.breakup.netMonthlySalary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><FileTextIcon /> Reports & Documents</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button variant="outline" onClick={() => setIsDownloadSalarySlipOpen(true)}><Download className="mr-2 h-4 w-4" /> Download Salary Slip</Button>
          <Dialog>
            <DialogTrigger asChild><Button variant="outline"><Eye className="mr-2 h-4 w-4" /> View NDA (Mock)</Button></DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader><DialogTitle>Non-Disclosure Agreement</DialogTitle></DialogHeader>
                <div className="prose prose-sm max-w-none dark:prose-invert max-h-[60vh] overflow-y-auto p-1">
                    <p>This is a mock NDA document for {user.name}, effective {new Date(profileData.secondaryData.joiningDate).toLocaleDateString('en-IN')}.</p>
                    <p>Content of NDA...</p>
                </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => setIsVerificationLetterOpen(true)}><FileTextIcon className="mr-2 h-4 w-4" /> Apply for Verification Letter</Button>
          <Dialog>
            <DialogTrigger asChild><Button variant="outline"><FileTextIcon className="mr-2 h-4 w-4" /> View Form 16 (Mock)</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Form 16 (Mock)</DialogTitle></DialogHeader>
                <p className="text-sm text-muted-foreground">Mock Form 16 for the latest financial year.</p>
                <Image src="https://picsum.photos/600/800?random&grayscale&blur=1&sig=form16view" alt="Mock Form 16" width={600} height={800} className="rounded-md mt-2" data-ai-hint="tax document form"/>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild><Button variant="outline"><ShieldCheck className="mr-2 h-4 w-4" /> View Digital ID</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Digital Employee ID</DialogTitle></DialogHeader>
              <div className="flex flex-col items-center">
                <Image src={profileData.reports.digitalIdImage} alt="Digital ID Card" width={300} height={180} className="rounded-lg border shadow-md object-contain" data-ai-hint="ID card company" />
                <p className="mt-4 text-lg font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{profileData.secondaryData.currentPosition}</p>
                <p className="text-xs text-muted-foreground">Employee ID: EMP{user.email.substring(0,3).toUpperCase()}001</p> {/* Mock ID */}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      
      {/* Holiday List Section */}
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><CalendarDays /> Company Holiday List 2024</CardTitle>
        </CardHeader>
        <CardContent>
            <h4 className="font-semibold text-md mb-2">Company Holidays:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm mb-4">
                {profileData.holidays.companyHolidays.map(h => <li key={h.name}>{new Date(h.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}: {h.name}</li>)}
            </ul>
            <h4 className="font-semibold text-md mb-2">Restricted Holidays (Choose 2):</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
                {profileData.holidays.restrictedHolidays.map(h => <li key={h.name}>{new Date(h.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}: {h.name}</li>)}
            </ul>
        </CardContent>
      </Card>


      {/* Dialogs */}
      {isEditPersonalOpen && <PersonalInformationEditDialog isOpen={isEditPersonalOpen} onClose={() => setIsEditPersonalOpen(false)} initialData={profileData.personal} onSubmit={handleSavePersonalInformation} />}
      <ApplyLeaveDialog isOpen={isApplyLeaveOpen} onClose={() => setIsApplyLeaveOpen(false)} onSubmit={handleApplyLeave} />
      <NominateRewardDialog isOpen={isNominateRewardOpen} onClose={() => setIsNominateRewardOpen(false)} onSubmit={handleNominateReward} employeeList={availableEmployeesForNomination} />
      <DownloadSalarySlipDialog isOpen={isDownloadSalarySlipOpen} onClose={() => setIsDownloadSalarySlipOpen(false)} onSubmit={handleDownloadSalarySlip} />
      <VerificationLetterDialog isOpen={isVerificationLetterOpen} onClose={() => setIsVerificationLetterOpen(false)} onSubmit={handleRequestVerificationLetter} />
    </div>
  );
}


    