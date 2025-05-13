
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"; // DialogClose removed as it is part of DialogContent
import { Badge } from "@/components/ui/badge";
// Input removed as it's not directly used here, but might be in sub-components
import { Label } from "@/components/ui/label"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useJobStore } from "@/store/jobStore";
import { useApplicantStore } from "@/store/applicantStore";
import { useEmployeeStore } from "@/store/employeeStore";
import { format, parseISO } from "date-fns";
import { Loader2, Mail, UserPlus, Eye, FileText as FileTextIcon, BriefcaseBusiness, Download, Send } from "lucide-react";
import { OfferLetterForm } from "@/components/document/offer-letter-form";
import { EmployeeForm, EMPLOYEE_TYPE_OPTIONS } from "@/components/employee/employee-form";
import { sendEmail } from '@/services/emailService'; // Import direct email service
import html2pdf from 'html2pdf.js';

export const OFFER_STATUS_OPTIONS = ["Pending", "Selected", "Offer Generated", "Offer Sent", "Offer Accepted", "Offer Rejected", "Hired", "Not Selected", "On Hold", "Rejected (Application)"];

const statusVariantMap = {
  Pending: "secondary",
  Selected: "default",
  "Offer Generated": "outline",
  "Offer Sent": "default",
  "Offer Accepted": "default",
  "Offer Rejected": "destructive",
  Hired: "default", 
  "Not Selected": "secondary",
  "On Hold": "secondary",
  "Rejected (Application)": "destructive",
};

// Placeholder HTML generation functions (copied from documents/page.jsx for brevity, consider moving to a shared util)
const generatePlaceholderOfferLetterHtml = (data) => {
  const currentDate = format(new Date(), "MMMM d, yyyy");
  return `
<div class="offer-letter-container" style="font-family: Arial, sans-serif; max-width: 800px; margin: 30px auto; padding: 30px; border: 1px solid #cccccc; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); line-height: 1.6; font-size: 12px;">
  <img src="https://www.pesuventurelabs.com/static/media/PVL%20Logo.9cc047dd.png" alt="${data.companyName} Logo" style="display: block; margin-bottom: 20px; max-height: 50px;" data-ai-hint="company logo PESU Venture Labs" />
  <h1 style="font-size: 1.5em; color: #333; margin-bottom: 5px;">${data.companyName}</h1>
  <p style="margin-bottom: 15px; font-size: 0.9em; color: #555;">PESU Venture Labs, PES University, 100 Feet Ring Road, Banashankari Stage III, Bengaluru, Karnataka 560085</p>
  <p style="text-align: right; margin-bottom: 20px;"><strong>Date:</strong> ${currentDate}</p>
  <p style="margin-top: 20px; margin-bottom: 15px;">Dear ${data.candidateName},</p>
  <p>Following our recent discussions, we are delighted to extend an offer of employment to you for the position of <strong>${data.positionTitle}</strong> at <strong>${data.companyName}</strong>.</p>
  <h3 style="font-size: 14px; color: #444; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Offer Details</h3>
  <p><strong>Position Title:</strong> ${data.positionTitle}</p>
  <p><strong>Department:</strong> ${data.department}</p>
  <p><strong>Reporting Manager:</strong> ${data.reportingManager}</p>
  <p><strong>Proposed Start Date:</strong> ${data.startDate}</p>
  <h3 style="font-size: 14px; color: #444; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Compensation & Benefits</h3>
  <p><strong>Salary:</strong> ${data.salary}</p>
  <p>Further details on benefits will be shared upon joining.</p>
  <p>To accept this offer, please sign and return this letter by <strong>${data.offerExpiryDate}</strong>. You can reply to this email with your signed acceptance.</p>
  <p style="margin-top: 25px;">We are very excited about the possibility of you joining our team and look forward to welcoming you to <strong>${data.companyName}</strong>.</p>
  <p style="margin-top: 30px;">Sincerely,</p>
  <p style="margin-top: 20px; font-weight: bold;">The Hiring Team</p>
  <p style="font-size: 0.95em;">${data.companyName}</p>
</div>`;
};

const generatePlaceholderJoiningLetterHtml = (data) => {
  const currentDate = format(new Date(), "MMMM d, yyyy");
  return `
<div class="joining-letter-container" style="font-family: 'Arial', sans-serif; max-width: 800px; margin: 30px auto; padding: 40px; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); line-height: 1.6; font-size: 12px;">
  <img src="https://www.pesuventurelabs.com/static/media/PVL%20Logo.9cc047dd.png" alt="${data.companyName} Logo" style="display: block; margin: 0 auto 25px auto; max-height: 60px;" data-ai-hint="company logo PESU Venture Labs"/>
  <h1 style="font-size: 1.7em; text-align: center; color: #2c3e50; margin-bottom: 5px;">${data.companyName}</h1>
  <p style="text-align: center; margin-bottom: 20px; font-size: 0.9em; color: #555;">${data.companyAddress}</p>
  <p style="text-align: right; margin-bottom: 25px;"><strong>Date:</strong> ${currentDate}</p>
  <p style="margin-bottom: 5px;"><strong>To,</strong></p>
  <p style="margin-bottom: 5px;"><strong>${data.employeeName}</strong></p>
  <p style="margin-top: 20px; margin-bottom: 15px;">Dear ${data.employeeName},</p>
  <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 15px; color: #333;">Subject: Joining Letter for the Position of ${data.positionTitle}</h3>
  <p>We are pleased to confirm your appointment at <strong>${data.companyName}</strong> for the position of <strong>${data.positionTitle}</strong> in the <strong>${data.department}</strong> department. We are excited to have you join our team!</p>
  <p>Your employment will commence on <strong>${data.startDate}</strong>. ${data.reportingManager ? `You will be reporting to <strong>${data.reportingManager}</strong>.` : 'Further details about your reporting structure will be shared upon joining.'}</p>
  <p>This is a <strong>${data.employeeType}</strong> position. Your starting salary will be <strong>${data.salary}</strong>, subject to statutory deductions.</p>
  <p>You will be on a probation period of six (6) months from your date of joining. Your performance will be reviewed during this period, and your confirmation will be based on a satisfactory review.</p>
  <p>Please bring the following documents on your first day for verification:</p>
  <ul style="margin-left: 20px; margin-bottom: 15px;"><li>Proof of Identity (Aadhaar/PAN Card)</li><li>Proof of Address</li><li>Educational Certificates (Highest Qualification)</li><li>Previous Employment Documents (if applicable)</li></ul>
  <p>Your employment will be governed by the policies and procedures of <strong>${data.companyName}</strong>, which will be shared with you during your induction.</p>
  <p style="margin-top: 25px;">We look forward to your joining and wish you a successful career with <strong>${data.companyName}</strong>.</p>
  <p style="margin-top: 30px;">Sincerely,</p>
  <div style="margin-top: 20px;">
    <p style="font-weight: bold;">For ${data.companyName}</p>
    <div style="height: 50px; width: 200px; border-bottom: 1px solid #000; margin-top: 10px; margin-bottom:5px;"></div>
    <p style="font-size: 0.95em;">Authorized Signatory</p>
    <p style="font-size: 0.95em;">(HR Department / Hiring Manager)</p>
  </div>
</div>`;
};


export default function OffersPage() {
  const { toast } = useToast();

  const jobs = useJobStore((state) => state.jobs || []);
  const _initializeJobs = useJobStore((state) => state._initializeJobs);

  const applicants = useApplicantStore((state) => state.applicants || []);
  // const getApplicantById = useApplicantStore((state) => state.getApplicantById); // Not used, safe to remove if confirmed
  const updateApplicant = useApplicantStore((state) => state.updateApplicant);
  const _initializeApplicants = useApplicantStore((state) => state._initializeApplicants);
  
  const addEmployee = useEmployeeStore((state) => state.addEmployee);
  const updateEmployee = useEmployeeStore((state) => state.updateEmployee); 
  const _initializeEmployees = useEmployeeStore((state) => state._initializeEmployees);
  const allEmployees = useEmployeeStore((state) => state.employees || []);


  const OFFER_STATUS_OPTIONS_FILTER = ["All", ...OFFER_STATUS_OPTIONS];

  const [selectedJobId, setSelectedJobId] = React.useState("");
  const [filteredApplicants, setFilteredApplicants] = React.useState([]);
  const [statusFilter, setStatusFilter] = React.useState(OFFER_STATUS_OPTIONS_FILTER[0]);

  const [selectedApplicantForOffer, setSelectedApplicantForOffer] = React.useState(null);
  const [selectedApplicantForOnboarding, setSelectedApplicantForOnboarding] = React.useState(null);
  const [currentEmployeeForJoiningLetter, setCurrentEmployeeForJoiningLetter] = React.useState(null);


  const [isOfferLetterDialogOpen, setIsOfferLetterDialogOpen] = React.useState(false);
  const [isJoiningFormOpen, setIsJoiningFormOpen] = React.useState(false);
  
  const [generatedOfferLetterHtml, setGeneratedOfferLetterHtml] = React.useState("");
  const [isLoadingOfferLetter, setIsLoadingOfferLetter] = React.useState(false);
  const [isEmailingOfferLetter, setIsEmailingOfferLetter] = React.useState(false);

  const [generatedJoiningLetterHtml, setGeneratedJoiningLetterHtml] = React.useState("");
  const [isLoadingJoiningLetter, setIsLoadingJoiningLetter] = React.useState(false);
  const [isEmailingJoiningLetter, setIsEmailingJoiningLetter] = React.useState(false);
  const [isJoiningLetterPreviewOpen, setIsJoiningLetterPreviewOpen] = React.useState(false);


  React.useEffect(() => {
    _initializeJobs();
    _initializeApplicants();
    _initializeEmployees();
  }, [_initializeJobs, _initializeApplicants, _initializeEmployees]);

  React.useEffect(() => {
    if (selectedJobId) {
      let jobApplicants = applicants.filter(app => app.jobId === selectedJobId);
      if (statusFilter !== "All") {
        jobApplicants = jobApplicants.filter(app => app.offerStatus === statusFilter);
      }
      setFilteredApplicants(jobApplicants);
    } else {
      setFilteredApplicants([]);
    }
  }, [selectedJobId, statusFilter, applicants]);

  const handleJobChange = (jobId) => {
    setSelectedJobId(jobId);
    setStatusFilter(OFFER_STATUS_OPTIONS_FILTER[0]); 
  };

  const handleOpenOfferLetterDialog = (applicant) => {
    setSelectedApplicantForOffer(applicant);
    setGeneratedOfferLetterHtml(applicant.offerLetterHtml || ""); 
    setIsOfferLetterDialogOpen(true);
  };

  const handleGenerateOfferLetter = async (offerData) => {
    if (!selectedApplicantForOffer) return;
    setIsLoadingOfferLetter(true);
    setGeneratedOfferLetterHtml("");
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate generation
      const htmlContent = generatePlaceholderOfferLetterHtml(offerData);
      
      if (htmlContent) {
        setGeneratedOfferLetterHtml(htmlContent);
        updateApplicant(selectedApplicantForOffer.id, { 
          offerStatus: "Offer Generated", 
          offeredSalary: offerData.salary,
          offeredStartDate: offerData.startDate, // This is already formatted "MMMM d, yyyy"
          offerLetterHtml: htmlContent 
        });
        toast({ title: "Offer Letter Generated", description: `Offer for ${selectedApplicantForOffer.name} is ready.` });
      } else {
        throw new Error("Failed to generate offer letter content.");
      }
    } catch (error) {
      console.error("Error generating offer letter:", error);
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingOfferLetter(false);
    }
  };

  const handleSendOfferLetterEmail = async () => {
    if (!selectedApplicantForOffer || !generatedOfferLetterHtml) {
        toast({ title: "Error", description: "No offer letter or applicant selected.", variant: "destructive" });
        return;
    }
    setIsEmailingOfferLetter(true);
    try {
        const emailBody = `<p>Dear ${selectedApplicantForOffer.name},</p><p>Please find your offer letter attached.</p><p>Sincerely,<br/>PESU Venture Labs HR</p>`;
        const result = await sendEmail({
            to: selectedApplicantForOffer.email,
            subject: `Job Offer from PESU Venture Labs for ${selectedApplicantForOffer.name}`,
            htmlBody: emailBody,
            attachments: [{
                filename: `${selectedApplicantForOffer.name.replace(/ /g, '_')}_Offer_Letter.html`,
                content: generatedOfferLetterHtml,
                contentType: 'text/html',
            }]
        });
        if (result.success) {
            updateApplicant(selectedApplicantForOffer.id, { offerStatus: "Offer Sent" });
            toast({ title: "Offer Letter Emailed", description: `Sent to ${selectedApplicantForOffer.email}.` });
            setIsOfferLetterDialogOpen(false); // Close dialog on successful send
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        toast({ title: "Email Failed", description: error.message, variant: "destructive" });
    } finally {
        setIsEmailingOfferLetter(false);
    }
  };
  
  const handleDownloadOfferLetterPdf = () => {
    if (!generatedOfferLetterHtml || !selectedApplicantForOffer) {
        toast({ title: "Error", description: "No offer letter to download.", variant: "destructive"});
        return;
    }
    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute'; tempElement.style.left = '-9999px'; tempElement.style.top = '0px'; tempElement.style.width = '1000px';
    tempElement.innerHTML = generatedOfferLetterHtml;
    document.body.appendChild(tempElement);

    const documentToCapture = tempElement.querySelector('.offer-letter-container');
     if (!documentToCapture) {
        document.body.removeChild(tempElement);
        toast({ title: "PDF Error", description: "Could not find content for PDF.", variant: "destructive" });
        return;
    }
    const filename = `${selectedApplicantForOffer.name.replace(/ /g, '_')}_Offer_Letter.pdf`;
    const opt = {
      margin: [10, 10, 10, 10], filename, image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, width: documentToCapture.scrollWidth, windowWidth: documentToCapture.scrollWidth },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
     html2pdf().from(documentToCapture).set(opt).save()
      .then(() => toast({ title: "PDF Downloaded", description: "Offer letter saved." }))
      .catch(err => { console.error(err); toast({ title: "PDF Error", description: "Failed to generate PDF.", variant: "destructive" }); })
      .finally(() => document.body.removeChild(tempElement));
  };

  const handleUpdateApplicantStatus = (applicantId, newStatus) => {
    updateApplicant(applicantId, { offerStatus: newStatus });
    toast({ title: "Status Updated", description: `Applicant status changed to ${newStatus}.` });
  };

  const handleOpenOnboardingForm = (applicant) => {
    setSelectedApplicantForOnboarding(applicant);
    setIsJoiningFormOpen(true);
  };

  const handleOnboardEmployee = async (employeeData) => {
    if (!selectedApplicantForOnboarding) return;
    setIsLoadingJoiningLetter(true);

    const newId = `EMP${String(Date.now()).slice(-4)}${String(allEmployees.length + 1).padStart(3, '0')}`;
    const newEmployeeBase = {
      ...employeeData,
      id: newId,
      avatarUrl: `https://i.pravatar.cc/150?u=${employeeData.email || newId}`,
      gender: employeeData.gender || "Other",
    };
    
    setCurrentEmployeeForJoiningLetter(newEmployeeBase);

    try {
      const joiningLetterInput = {
        employeeName: newEmployeeBase.name,
        employeeEmail: newEmployeeBase.email,
        positionTitle: newEmployeeBase.role,
        department: newEmployeeBase.department,
        startDate: format(new Date(newEmployeeBase.joinDate), "MMMM d, yyyy"),
        salary: newEmployeeBase.salary || "As per offer",
        employeeType: newEmployeeBase.employeeType,
        companyName: "PESU Venture Labs",
        companyAddress: "PESU Venture Labs, PES University, 100 Feet Ring Road, Banashankari Stage III, Bengaluru, Karnataka 560085",
        reportingManager: newEmployeeBase.reportingManager || "To be assigned"
      };
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate generation
      const htmlContent = generatePlaceholderJoiningLetterHtml(joiningLetterInput);

      if (htmlContent) {
        setGeneratedJoiningLetterHtml(htmlContent);
        const newEmployeeWithLetter = { ...newEmployeeBase, joiningLetterHtml: htmlContent };
        addEmployee(newEmployeeWithLetter);
        updateApplicant(selectedApplicantForOnboarding.id, { offerStatus: "Hired" });
        toast({ title: "Employee Onboarded & Joining Letter Generated", description: `${newEmployeeBase.name} added. Preview letter.` });
        setIsJoiningLetterPreviewOpen(true); 
      } else {
        throw new Error("Failed to generate joining letter content.");
      }
    } catch (error) {
      console.error("Error generating joining letter:", error);
      toast({ title: "Joining Letter Failed", description: error.message, variant: "destructive" });
      // Still add employee and update applicant status
      addEmployee(newEmployeeBase);
      updateApplicant(selectedApplicantForOnboarding.id, { offerStatus: "Hired" });
      toast({ title: "Employee Onboarded (Letter Failed)", description: `${newEmployeeBase.name} added. Letter generation failed.`});
    } finally {
      setIsLoadingJoiningLetter(false);
      setIsJoiningFormOpen(false); 
      // Keep selectedApplicantForOnboarding to allow letter actions if dialog opens
    }
  };

  const handleDownloadJoiningLetterPdf = () => {
    if (!generatedJoiningLetterHtml || !currentEmployeeForJoiningLetter) { 
        toast({ title: "Error", description: "No joining letter content for the new employee.", variant: "destructive"});
        return;
    }
    
    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute'; tempElement.style.left = '-9999px'; tempElement.style.top = '0px'; tempElement.style.width = '1000px';
    tempElement.innerHTML = generatedJoiningLetterHtml;
    document.body.appendChild(tempElement);
    const documentToCapture = tempElement.querySelector('.joining-letter-container');
    if (!documentToCapture) {
        document.body.removeChild(tempElement);
        toast({ title: "PDF Error", description: "Could not find content for PDF.", variant: "destructive" });
        return;
    }
    const filename = `${currentEmployeeForJoiningLetter.name.replace(/ /g, '_')}_Joining_Letter.pdf`;
    const opt = { margin: [10,10,10,10], filename, image: {type: 'jpeg', quality: 0.98}, html2canvas: {scale: 2, useCORS: true, width: documentToCapture.scrollWidth, windowWidth: documentToCapture.scrollWidth}, jsPDF: {unit: 'mm', format: 'a4', orientation: 'portrait'}};
    html2pdf().from(documentToCapture).set(opt).save()
      .then(() => toast({ title: "PDF Downloaded", description: "Joining letter saved." }))
      .catch(err => { console.error(err); toast({ title: "PDF Error", description: "Failed to generate PDF.", variant: "destructive" }); })
      .finally(() => document.body.removeChild(tempElement));
  };

  const handleEmailJoiningLetter = async () => {
    if (!generatedJoiningLetterHtml || !currentEmployeeForJoiningLetter) {
        toast({ title: "Error", description: "No joining letter or employee data for email.", variant: "destructive"});
        return;
    }
    setIsEmailingJoiningLetter(true);
    try {
        const emailBody = `<p>Dear ${currentEmployeeForJoiningLetter.name},</p><p>Welcome to PESU Venture Labs! Your joining letter is attached.</p><p>Sincerely,<br/>PESU Venture Labs HR</p>`;
        const result = await sendEmail({
            to: currentEmployeeForJoiningLetter.email,
            subject: `Welcome to PESU Venture Labs - Your Joining Letter`,
            htmlBody: emailBody,
            attachments: [{
                filename: `${currentEmployeeForJoiningLetter.name.replace(/ /g, '_')}_Joining_Letter.html`,
                content: generatedJoiningLetterHtml,
                contentType: 'text/html'
            }]
        });
        if (result.success) {
            toast({ title: "Email Sent", description: `Joining letter sent to ${currentEmployeeForJoiningLetter.email}.` });
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        toast({ title: "Email Failed", description: error.message, variant: "destructive" });
    } finally {
        setIsEmailingJoiningLetter(false);
    }
  };
  
  const ROLES_OPTIONS = ["Software Engineer", "Project Manager", "UX Designer", "HR Specialist", "Frontend Developer", "Sales Executive", "Marketing Manager", "Data Analyst", "QA Engineer", "DevOps Engineer", "Product Owner", "Business Analyst", "System Administrator", "Operations Head", "Accountant"];
  const DESIGNATION_OPTIONS = ["Intern", "Trainee", "Junior Developer", "Associate Developer", "Developer", "Senior Developer", "Team Lead", "Principal Engineer", "Junior Designer", "Designer", "Senior Designer", "HR Executive", "Senior HR", "Sales Rep", "Senior Sales Rep", "Analyst", "Senior Analyst", "Associate QA", "QA Engineer", "Senior QA", "DevOps Engineer", "Senior DevOps", "Product Manager", "Senior Product Manager", "Manager", "Director", "Administrator", "Accountant"];
  const DEPARTMENTS_OPTIONS = ["Technology", "Operations", "Design", "Human Resources", "Sales", "Marketing", "Finance", "Product", "Quality Assurance", "IT", "Administration"];
  const STATUS_OPTIONS = ["Active", "On Leave", "Terminated", "Probation", "Resigned"];

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Manage Offers & Onboarding</CardTitle>
          </div>
          <CardDescription>
            Select a job to view applicants, generate offer letters, and onboard candidates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="job-select">Select Job Posting</Label>
              <Select value={selectedJobId} onValueChange={handleJobChange}>
                <SelectTrigger id="job-select">
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} ({job.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {OFFER_STATUS_OPTIONS_FILTER.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedJobId ? (
            filteredApplicants.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Assertify Score</TableHead>
                      <TableHead>Resume</TableHead>
                      <TableHead>Current Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplicants.map((applicant) => (
                      <TableRow key={applicant.id}>
                        <TableCell className="font-medium">{applicant.name}</TableCell>
                        <TableCell>{applicant.email}</TableCell>
                        <TableCell>
                          <Badge variant={applicant.assertifyScore >= 85 ? "default" : "secondary"}>
                            {applicant.assertifyScore}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <a href={applicant.resumeLink || "#"} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            View Resume
                          </a>
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={applicant.offerStatus} 
                            onValueChange={(newStatus) => handleUpdateApplicantStatus(applicant.id, newStatus)}
                          >
                            <SelectTrigger className="w-[180px] h-8 text-xs">
                              <SelectValue placeholder="Update status" />
                            </SelectTrigger>
                            <SelectContent>
                              {OFFER_STATUS_OPTIONS.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                           <Badge variant={statusVariantMap[applicant.offerStatus] || "outline"} className="mt-1 text-xs">
                             {applicant.offerStatus}
                           </Badge>
                        </TableCell>
                        <TableCell className="space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenOfferLetterDialog(applicant)}
                            disabled={!(applicant.offerStatus === "Selected" || applicant.offerStatus === "Offer Generated" || applicant.offerStatus === "Offer Sent")}
                          >
                            <FileTextIcon className="mr-1 h-3.5 w-3.5" /> Offer
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => handleOpenOnboardingForm(applicant)}
                            disabled={applicant.offerStatus !== "Offer Accepted"}
                          >
                            <UserPlus className="mr-1 h-3.5 w-3.5" /> Onboard
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <p>No applicants match the current filters for this job.</p>
              </div>
            )
          ) : (
            <div className="text-center py-10 text-muted-foreground">
                <BriefcaseBusiness className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg font-medium">Please select a job posting to view applicants.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offer Letter Dialog */}
      <Dialog open={isOfferLetterDialogOpen} onOpenChange={setIsOfferLetterDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Offer Letter for {selectedApplicantForOffer?.name}</DialogTitle>
            <DialogDescription>
              {generatedOfferLetterHtml ? "Review the generated offer letter below." : "Fill in the details to generate an offer letter."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-h-[75vh] overflow-y-auto p-1">
            <div className="lg:col-span-1">
              <OfferLetterForm 
                onSubmit={handleGenerateOfferLetter} 
                isLoading={isLoadingOfferLetter}
                initialData={selectedApplicantForOffer ? {
                    candidateName: selectedApplicantForOffer.name,
                    candidateEmail: selectedApplicantForOffer.email,
                    positionTitle: jobs.find(j => j.id === selectedApplicantForOffer.jobId)?.title || "",
                    department: jobs.find(j => j.id === selectedApplicantForOffer.jobId)?.department || "",
                    salary: selectedApplicantForOffer.offeredSalary || "",
                    startDate: selectedApplicantForOffer.offeredStartDate ? (selectedApplicantForOffer.offeredStartDate.includes(" ") ? format(new Date(selectedApplicantForOffer.offeredStartDate), "yyyy-MM-dd") : selectedApplicantForOffer.offeredStartDate) : format(new Date(), "yyyy-MM-dd"),
                    offerExpiryDate: selectedApplicantForOffer.offerExpiryDate ? (selectedApplicantForOffer.offerExpiryDate.includes(" ") ? format(new Date(selectedApplicantForOffer.offerExpiryDate), "yyyy-MM-dd") : selectedApplicantForOffer.offerExpiryDate) : format(new Date(new Date().setDate(new Date().getDate() + 7)), "yyyy-MM-dd"),
                    companyName: "PESU Venture Labs",
                } : {
                    companyName: "PESU Venture Labs",
                    startDate: format(new Date(), "yyyy-MM-dd"),
                    offerExpiryDate: format(new Date(new Date().setDate(new Date().getDate() + 7)), "yyyy-MM-dd"),
                }}
              />
            </div>
            <div className="lg:col-span-2">
              {isLoadingOfferLetter ? (
                <div className="flex items-center justify-center h-full min-h-[300px]">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : generatedOfferLetterHtml ? (
                <div className="space-y-3">
                    <div 
                        className="p-4 border rounded-md bg-white shadow-sm overflow-auto max-h-[60vh] min-h-[300px] prose prose-sm max-w-none dark:bg-slate-900 dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: generatedOfferLetterHtml }}
                    />
                    <div className="flex flex-wrap gap-2 pt-2">
                        <Button onClick={handleDownloadOfferLetterPdf} variant="outline" size="sm" disabled={!generatedOfferLetterHtml || isLoadingOfferLetter || isEmailingOfferLetter}>
                            <Download className="mr-2 h-4 w-4" /> Download PDF
                        </Button>
                        <Button onClick={handleSendOfferLetterEmail} variant="default" size="sm" disabled={!generatedOfferLetterHtml || isLoadingOfferLetter || isEmailingOfferLetter}>
                            {isEmailingOfferLetter ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            {isEmailingOfferLetter ? "Sending..." : "Email Offer"}
                        </Button>
                    </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed rounded-md bg-muted/20">
                    <FileTextIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-lg text-muted-foreground">Offer letter preview will appear here.</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOfferLetterDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Onboarding Form Dialog (EmployeeForm) */}
      <Dialog open={isJoiningFormOpen} onOpenChange={setIsJoiningFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Onboard {selectedApplicantForOnboarding?.name} as Employee</DialogTitle>
            <DialogDescription>Fill in the employee details. A joining letter will be generated upon submission.</DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[70vh] overflow-y-auto pr-2">
            <EmployeeForm
              onSubmit={handleOnboardEmployee}
              initialData={selectedApplicantForOnboarding ? { 
                name: selectedApplicantForOnboarding.name, 
                email: selectedApplicantForOnboarding.email,
                role: jobs.find(j => j.id === selectedApplicantForOnboarding.jobId)?.title || "",
                designation: "", 
                department: jobs.find(j => j.id === selectedApplicantForOnboarding.jobId)?.department || "",
                joinDate: selectedApplicantForOnboarding.offeredStartDate ? (selectedApplicantForOnboarding.offeredStartDate.includes(" ") ? new Date(selectedApplicantForOnboarding.offeredStartDate) : parseISO(selectedApplicantForOnboarding.offeredStartDate)) : new Date(),
                status: "Probation", 
                salary: selectedApplicantForOnboarding.offeredSalary || "",
                employeeType: "Full-time", 
                gender: "", 
              } : {}}
              onCancel={() => setIsJoiningFormOpen(false)}
              rolesOptions={ROLES_OPTIONS}
              designationOptions={DESIGNATION_OPTIONS}
              departmentsOptions={DEPARTMENTS_OPTIONS}
              statusOptions={STATUS_OPTIONS}
              employeeTypeOptions={EMPLOYEE_TYPE_OPTIONS}
            />
          </div>
        </DialogContent>
      </Dialog>

        {/* Joining Letter Preview Dialog */}
        <Dialog open={isJoiningLetterPreviewOpen} onOpenChange={() => setIsJoiningLetterPreviewOpen(false)}>
            <DialogContent className="sm:max-w-3xl lg:max-w-4xl">
            <DialogHeader>
                <DialogTitle>Joining Letter Preview for {currentEmployeeForJoiningLetter?.name || "New Employee"}</DialogTitle>
            </DialogHeader>
            <div className="py-4 max-h-[70vh] overflow-y-auto pr-2">
                {isLoadingJoiningLetter && <div className="flex justify-center items-center min-h-[200px]"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                {!isLoadingJoiningLetter && generatedJoiningLetterHtml && (
                <div className="p-4 border rounded-md bg-white shadow-sm" dangerouslySetInnerHTML={{ __html: generatedJoiningLetterHtml }} />
                )}
                 {!isLoadingJoiningLetter && !generatedJoiningLetterHtml && (
                 <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed rounded-md bg-muted/20">
                    <FileTextIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-lg text-muted-foreground">No letter generated or an error occurred.</p>
                 </div>
                )}
            </div>
            <DialogFooter className="mt-4 sm:justify-end gap-2">
                <Button variant="outline" onClick={() => setIsJoiningLetterPreviewOpen(false)}>Close</Button>
                <Button onClick={handleDownloadJoiningLetterPdf} disabled={!generatedJoiningLetterHtml || isLoadingJoiningLetter || isEmailingJoiningLetter}>
                    <Download className="mr-2 h-4 w-4" /> PDF
                </Button>
                <Button onClick={handleEmailJoiningLetter} disabled={!generatedJoiningLetterHtml || isLoadingJoiningLetter || isEmailingJoiningLetter}>
                    {isEmailingJoiningLetter ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Email
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}
