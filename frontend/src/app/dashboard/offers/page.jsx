
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"; 
import { Badge } from "@/components/ui/badge";
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
import { sendEmail } from '@/services/emailService'; 
import html2pdf from 'html2pdf.js';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams


// Import HTML generation functions
import { generatePlaceholderOfferLetterHtml } from '@/lib/document-templates/offer-letter';
import { generatePlaceholderJoiningLetterHtml } from '@/lib/document-templates/joining-letter';


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

const managerRoles = ['Manager', 'Super Admin', 'Admin', 'Project Manager', 'HR Specialist', 'Operations Head'];

export default function OffersPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams(); // Initialize searchParams

  const jobs = useJobStore((state) => state.jobs || []);
  const _initializeJobs = useJobStore((state) => state._initializeJobs);

  const applicants = useApplicantStore((state) => state.applicants || []);
  const updateApplicant = useApplicantStore((state) => state.updateApplicant);
  const _initializeApplicants = useApplicantStore((state) => state._initializeApplicants);
  
  const addEmployee = useEmployeeStore((state) => state.addEmployee);
  const _initializeEmployees = useEmployeeStore((state) => state._initializeEmployees);
  const allEmployees = useEmployeeStore((state) => state.employees || []);

  const managerOptions = React.useMemo(() =>
    allEmployees
        .filter(emp => managerRoles.includes(emp.role))
        .map(emp => emp.name)
  , [allEmployees]);


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
    const queryJobId = searchParams.get('jobId');
    if (queryJobId && jobs.length > 0) {
      if (jobs.find(job => job.id === queryJobId)) {
        setSelectedJobId(queryJobId);
      } else {
         console.warn(`Job ID "${queryJobId}" from query parameter not found.`);
         // If navigating from elsewhere without a valid jobId, or if jobId is invalid, don't auto-select.
         // If selectedJobId is already set (e.g., by user interaction), don't override unless queryJobId is new and valid.
         if (!selectedJobId && jobs.length > 0) {
            // setSelectedJobId(jobs[0].id); // Optionally default to first job if queryJobId is invalid and no job is selected
         }
      }
    } else if (!queryJobId && jobs.length > 0 && !selectedJobId) {
        // If no query param and no job selected, could default to first job, or leave empty
        // setSelectedJobId(jobs[0].id); 
    }
  }, [searchParams, jobs, selectedJobId]); // Add selectedJobId to prevent re-running if it's already set by user

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
      await new Promise(resolve => setTimeout(resolve, 500)); 
      const htmlContent = generatePlaceholderOfferLetterHtml(offerData);
      
      if (htmlContent) {
        setGeneratedOfferLetterHtml(htmlContent);
        updateApplicant(selectedApplicantForOffer.id, { 
          offerStatus: "Offer Generated", 
          offeredSalary: offerData.salary,
          offeredStartDate: offerData.startDate, // Assuming offerData.startDate is already formatted string
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
            setIsOfferLetterDialogOpen(false); 
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
      
      await new Promise(resolve => setTimeout(resolve, 500)); 
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
      addEmployee(newEmployeeBase);
      updateApplicant(selectedApplicantForOnboarding.id, { offerStatus: "Hired" });
      toast({ title: "Employee Onboarded (Letter Failed)", description: `${newEmployeeBase.name} added. Letter generation failed.`});
    } finally {
      setIsLoadingJoiningLetter(false);
      setIsJoiningFormOpen(false); 
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
                            disabled={applicant.offerStatus?.trim() !== "Offer Accepted"}
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
                    reportingManager: (jobs.find(j => j.id === selectedApplicantForOffer.jobId)?.projectManager && managerOptions.includes(jobs.find(j => j.id === selectedApplicantForOffer.jobId)?.projectManager)) ? jobs.find(j => j.id === selectedApplicantForOffer.jobId)?.projectManager : "",
                } : {
                    companyName: "PESU Venture Labs",
                    startDate: format(new Date(), "yyyy-MM-dd"),
                    offerExpiryDate: format(new Date(new Date().setDate(new Date().getDate() + 7)), "yyyy-MM-dd"),
                    reportingManager: "",
                }}
                managerOptions={managerOptions}
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
                reportingManager: (jobs.find(j => j.id === selectedApplicantForOnboarding.jobId)?.projectManager && managerOptions.includes(jobs.find(j => j.id === selectedApplicantForOnboarding.jobId)?.projectManager)) ? jobs.find(j => j.id === selectedApplicantForOnboarding.jobId)?.projectManager : "",
              } : {}}
              onCancel={() => setIsJoiningFormOpen(false)}
              rolesOptions={ROLES_OPTIONS}
              designationOptions={DESIGNATION_OPTIONS}
              departmentsOptions={DEPARTMENTS_OPTIONS}
              statusOptions={STATUS_OPTIONS}
              employeeTypeOptions={EMPLOYEE_TYPE_OPTIONS}
              reportingManagerOptions={managerOptions}
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

