"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { DownloadSalarySlipDialog } from "@/components/profile/download-salary-slip-dialog";
import { VerificationLetterDialog } from "@/components/profile/verification-letter-dialog";
import { useToast } from "@/hooks/use-toast";
import { useMockAuth } from "@/hooks/use-mock-auth";
import { FileText, Download, Eye, ShieldCheck } from "lucide-react";

// Mock data relevant to this page
const mockDocumentsData = {
  ndaPath: "/documents/NDA_JohnDoe.pdf", // Mock path
  form16Path: "/documents/Form16_JohnDoe_2023.pdf", // Mock path
  digitalIdImage: "https://www.pesuventurelabs.com/static/media/PVL%20Logo.9cc047dd.png", // Using PVL logo as placeholder
  joiningDate: "2022-08-15", // Needed for NDA mock
  companyName: "PESU Venture Labs" // Needed for NDA mock
};


export default function MyDocumentsPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useMockAuth();

  const [isDownloadSalarySlipOpen, setIsDownloadSalarySlipOpen] = React.useState(false);
  const [isVerificationLetterOpen, setIsVerificationLetterOpen] = React.useState(false);

  if (authLoading || !user) {
    return <div>Loading documents...</div>;
  }

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl"><FileText /> My Reports & Documents</CardTitle>
          <CardDescription>Access your personal documents and request new ones.</CardDescription>
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
                <p>This Non-Disclosure Agreement (the &quot;Agreement&quot;) is entered into as of {new Date(mockDocumentsData.joiningDate).toLocaleDateString()} by and between {user.name} (&quot;Employee&quot;) and {mockDocumentsData.companyName} (&quot;Company&quot;).</p>
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
              <Image src="https://picsum.photos/600/800?random&grayscale&blur=2&sig=form16" alt="Mock Form 16" width={600} height={800} className="rounded-md mt-2" data-ai-hint="tax form document"/>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
               <Button variant="outline"><ShieldCheck className="mr-2 h-4 w-4" /> View Digital ID</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Digital Employee ID</DialogTitle></DialogHeader>
              <div className="flex flex-col items-center">
                <Image src={mockDocumentsData.digitalIdImage} alt="Digital ID Card" width={300} height={180} className="rounded-lg border shadow-md object-contain" data-ai-hint="ID card employee" />
                <p className="mt-4 text-lg font-semibold">{user.name}</p>
                {/* <p className="text-sm text-muted-foreground">{user.currentPosition || "Employee"}</p> */} {/* Position might come from user object or mockProfileData */}
                <p className="text-xs text-muted-foreground">Employee ID: EMP{user.email.substring(0,3).toUpperCase()}001</p> {/* Mock ID */}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      <DownloadSalarySlipDialog isOpen={isDownloadSalarySlipOpen} onClose={() => setIsDownloadSalarySlipOpen(false)} onSubmit={handleDownloadSalarySlip} />
      <VerificationLetterDialog isOpen={isVerificationLetterOpen} onClose={() => setIsVerificationLetterOpen(false)} onSubmit={handleRequestVerificationLetter} />
    </div>
  );
}
