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
import { Loader2, Mail, UserPlus, Eye, FileText as FileTextIcon, BriefcaseBusiness, Download, Send, XCircle, UploadCloud, FileText, MoreVertical } from "lucide-react";
import { OfferLetterForm } from "@/components/document/offer-letter-form";
import { EmployeeForm, EMPLOYEE_TYPE_OPTIONS } from "@/components/employee/employee-form";
import { sendEmail } from '@/services/emailService'; 
import html2pdf from 'html2pdf.js';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import { OfferHistory } from "@/components/offer/offer-history";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ApplicantForm } from "@/components/applicant/applicant-form";
import moment from "moment";
import { useDepartmentStore } from '@/store/departmentStore';
import { s3Service } from '@/services/s3Service';
import { Input } from "@/components/ui/input";


// Import HTML generation functions
import { generatePlaceholderOfferLetterHtml } from '@/lib/document-templates/offer-letter';
import { generatePlaceholderJoiningLetterHtml } from '@/lib/document-templates/joining-letter';
import { generatePlaceholderInternshipOfferLetterHtml } from '@/lib/document-templates/internship-offer-letter';


export const OFFER_STATUS_OPTIONS = [
  "PENDING_OFFER",
  "SELECTED",
  "OFFER_GENERATED",
  "OFFER_SENT",
  "OFFER_ACCEPTED",
  "OFFER_REJECTED",
  "HIRED",
  "NOT_SELECTED",
  "ON_HOLD_OFFER",
  "REJECTED_APPLICATION"
];

const formatOfferStatus = (status) => {
  const map = {
    PENDING_OFFER: "Pending",
    SELECTED: "Selected",
    OFFER_GENERATED: "Offer Generated",
    OFFER_SENT: "Offer Sent",
    OFFER_ACCEPTED: "Offer Accepted",
    OFFER_REJECTED: "Offer Rejected",
    HIRED: "Hired",
    NOT_SELECTED: "Not Selected",
    ON_HOLD_OFFER: "On Hold",
    REJECTED_APPLICATION: "Rejected (Application)"
  };
  return map[status] || status;
};

const statusVariantMap = {
  PENDING_OFFER: "secondary",
  SELECTED: "default",
  OFFER_GENERATED: "outline",
  OFFER_SENT: "default",
  OFFER_ACCEPTED: "default",
  OFFER_REJECTED: "destructive",
  HIRED: "default",
  NOT_SELECTED: "secondary",
  ON_HOLD_OFFER: "secondary",
  REJECTED_APPLICATION: "destructive",
};

const managerRoles = ['Manager', 'Super Admin', 'Admin', 'Project Manager', 'HR Specialist', 'Operations Head'];

const predefinedNotes = [
  "Candidate requested more info",
  "Waiting for documents",
  "Manager follow-up needed",
  "Offer revision discussed",
  "Other"
];

export default function OffersPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams(); // Initialize searchParams

  // Job store
  const jobs = useJobStore((state) => state.jobs || []);
  const initializeJobs = useJobStore((state) => state.initializeJobs);
  const jobLoading = useJobStore((state) => state.loading);
  const jobError = useJobStore((state) => state.error);

  // Applicant store
  const applicants = useApplicantStore((state) => state.applicants || []);
  const updateApplicant = useApplicantStore((state) => state.updateApplicant);
  const initializeApplicants = useApplicantStore((state) => state.initializeApplicants);
  const applicantLoading = useApplicantStore((state) => state.loading);
  const applicantError = useApplicantStore((state) => state.error);
  
  // Employee store
  const addEmployee = useEmployeeStore((state) => state.addEmployee);
  const initializeEmployees = useEmployeeStore((state) => state.initializeEmployees);
  const allEmployees = useEmployeeStore((state) => state.employees || []);

  // Get manager options: all employees except those with role 'EMPLOYEE'
  const managerOptions = React.useMemo(() =>
    allEmployees
      .filter(emp => emp.role !== 'EMPLOYEE')
      .map(emp => ({
        id: emp.id,
        value: emp.id,
        label: `${emp.name} (${emp.role})`
      })),
    [allEmployees]
  );


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

  // Add state for viewing history
  const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
  const [historyApplicant, setHistoryApplicant] = React.useState(null);

  // Add state for note dialog
  const [noteDialogOpen, setNoteDialogOpen] = React.useState(false);
  const [noteApplicant, setNoteApplicant] = React.useState(null);
  const [selectedNote, setSelectedNote] = React.useState("");
  const [customNote, setCustomNote] = React.useState("");

  const addNoteToApplicant = useApplicantStore((state) => state.addNoteToApplicant);

  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [newApplicant, setNewApplicant] = React.useState({ name: "", email: "", jobId: "", assertifyScore: "", resumeFile: null, resumeLink: "" });
  const addApplicant = useApplicantStore((state) => state.addApplicant);

  const departments = useDepartmentStore((state) => state.departments);

  // Add new state for resume upload dialog
  const [isResumeUploadDialogOpen, setIsResumeUploadDialogOpen] = React.useState(false);
  const [selectedApplicantForResume, setSelectedApplicantForResume] = React.useState(null);
  const [isUploadingResume, setIsUploadingResume] = React.useState(false);

  // Add new state for selected file
  const [selectedResumeFile, setSelectedResumeFile] = React.useState(null);
  const fileInputRef = React.useRef(null);

  // Initialize data
  React.useEffect(() => {
    initializeJobs();
    initializeApplicants();
    initializeEmployees();
  }, [initializeJobs, initializeApplicants, initializeEmployees]);

  // Handle errors
  React.useEffect(() => {
    if (jobError) {
      toast({
        title: "Error",
        description: jobError,
        variant: "destructive",
      });
    }
  }, [jobError, toast]);

  React.useEffect(() => {
    if (applicantError) {
      toast({
        title: "Error",
        description: applicantError,
        variant: "destructive",
      });
    }
  }, [applicantError, toast]);

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
    console.log("selectedJobId", selectedJobId);
    if (selectedJobId) {
      let jobApplicants = applicants.filter(app => app.jobPostingId === selectedJobId);
      if (statusFilter !== "All") {
        jobApplicants = jobApplicants.filter(app => app.offerStatus === statusFilter);
      }
      console.log("jobApplicants", jobApplicants);
      setFilteredApplicants(jobApplicants);
    } else {
      setFilteredApplicants([]);
    }
  }, [selectedJobId, statusFilter, applicants]);

  // Persist selectedJobId in localStorage
  React.useEffect(() => {
    const storedJobId = typeof window !== 'undefined' ? localStorage.getItem('selectedJobId') : null;
    if (storedJobId && jobs.find(j => j.id === storedJobId)) {
      setSelectedJobId(storedJobId);
    }
  }, [jobs]);

  const handleJobChange = (jobId) => {
    setSelectedJobId(jobId);
    setStatusFilter(OFFER_STATUS_OPTIONS_FILTER[0]); 
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedJobId', jobId);
    }
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
      
      // Get the job details to check if it's an internship
      const job = jobs.find(j => j.id === selectedApplicantForOffer.jobPostingId);
      const isInternship = job?.employeeType === "INTERN";

      // Get reporting manager details
      const reportingManager = managerOptions.find(m => m.id === offerData.reportingManager);
      const reportingManagerName = reportingManager ? reportingManager.label : 'To be assigned';
      
      // Use appropriate template based on job type
      const htmlContent = isInternship 
        ? generatePlaceholderInternshipOfferLetterHtml({
            candidateName: offerData.candidateName,
            candidateEmail: offerData.candidateEmail,
            positionTitle: offerData.positionTitle,
            department: offerData.department,
            salary: offerData.salary,
            startDate: offerData.startDate,
            offerExpiryDate: offerData.offerExpiryDate,
            companyName: offerData.companyName,
            reportingManager: reportingManagerName // Use the formatted name
          })
        : generatePlaceholderOfferLetterHtml({
            candidateName: offerData.candidateName,
            candidateEmail: offerData.candidateEmail,
            positionTitle: offerData.positionTitle,
            department: offerData.department,
            salary: offerData.salary,
            startDate: offerData.startDate,
            offerExpiryDate: offerData.offerExpiryDate,
            companyName: offerData.companyName,
            reportingManager: reportingManagerName // Use the formatted name
          });
      
      if (htmlContent) {
        setGeneratedOfferLetterHtml(htmlContent);
        updateApplicant(selectedApplicantForOffer.id, { 
          offerStatus: "OFFER_GENERATED", 
          offeredSalary: offerData.salary,
          offeredStartDate: moment(offerData.startDate, ["MMMM D, YYYY", moment.ISO_8601, "YYYY-MM-DD"]).isValid() ? moment(offerData.startDate, ["MMMM D, YYYY", moment.ISO_8601, "YYYY-MM-DD"]).format("YYYY-MM-DD") : undefined,
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
        // Create a temporary container for PDF generation
        const tempElement = document.createElement('div');
        tempElement.style.position = 'absolute';
        tempElement.style.left = '-9999px';
        tempElement.style.top = '0px';
        tempElement.style.width = '800px';
        tempElement.style.padding = '40px';
        tempElement.style.backgroundColor = 'white';
        tempElement.innerHTML = generatedOfferLetterHtml;
        document.body.appendChild(tempElement);

        // Wait for images to load
        await Promise.all(
            Array.from(tempElement.getElementsByTagName('img')).map(
                img => new Promise((resolve) => {
                    if (img.complete) resolve();
                    else img.onload = resolve;
                })
            )
        );

        const documentToCapture = tempElement.querySelector('.offer-letter-container');
        if (!documentToCapture) {
            document.body.removeChild(tempElement);
            throw new Error("Could not find content for PDF generation");
        }

        // Ensure all styles are properly applied
        const style = document.createElement('style');
        style.textContent = `
            .offer-letter-container {
                width: 100%;
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
                background: white;
                font-family: Arial, sans-serif;
            }
            .offer-letter-container img {
                max-width: 100%;
                height: auto;
            }
            .offer-letter-container * {
                box-sizing: border-box;
            }
        `;
        tempElement.appendChild(style);

        // Generate PDF with improved settings
        const pdfBlob = await html2pdf()
            .set({
                margin: [10, 10, 10, 10],
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    allowTaint: true,
                    foreignObjectRendering: true,
                    width: 800,
                    windowWidth: 800,
                    logging: true,
                    onclone: (clonedDoc) => {
                        // Ensure the cloned document has all styles
                        const clonedElement = clonedDoc.querySelector('.offer-letter-container');
                        if (clonedElement) {
                            clonedElement.style.width = '800px';
                            clonedElement.style.padding = '40px';
                            clonedElement.style.backgroundColor = 'white';
                        }
                    }
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait',
                    compress: true
                }
            })
            .from(documentToCapture)
            .output('blob');

        // Clean up temporary element
        document.body.removeChild(tempElement);

        // Convert blob to base64 for email attachment
        const pdfBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(pdfBlob);
        });

        const emailBody = `
            <p>Dear ${selectedApplicantForOffer.name},</p>
            <p>We are pleased to extend an offer of employment to you. Please find your offer letter attached in both HTML and PDF formats.</p>
            <p>Your details:</p>
            <ul>
                <li>Position: ${selectedApplicantForOffer.positionTitle || 'To be assigned'}</li>
                <li>Department: ${selectedApplicantForOffer.department || 'To be assigned'}</li>
                <li>Join Date: ${selectedApplicantForOffer.offeredStartDate ? format(new Date(selectedApplicantForOffer.offeredStartDate), "MMMM d, yyyy") : 'To be confirmed'}</li>
            </ul>
            <p>Please review the offer letter and let us know if you have any questions.</p>
            <p>Best regards,<br/>PESU Venture Labs HR Team</p>
        `;

        const result = await sendEmail({
            to: selectedApplicantForOffer.email,
            subject: `Job Offer from PESU Venture Labs for ${selectedApplicantForOffer.name}`,
            htmlBody: emailBody,
            attachments: [
                {
                filename: `${selectedApplicantForOffer.name.replace(/ /g, '_')}_Offer_Letter.html`,
                content: generatedOfferLetterHtml,
                contentType: 'text/html',
                },
                {
                    filename: `${selectedApplicantForOffer.name.replace(/ /g, '_')}_Offer_Letter.pdf`,
                    content: pdfBase64,
                    contentType: 'application/pdf',
                    encoding: 'base64'
                }
            ]
        });

        if (result.success) {
            updateApplicant(selectedApplicantForOffer.id, { offerStatus: "OFFER_SENT" });
            toast({ title: "Offer Letter Emailed", description: `Sent to ${selectedApplicantForOffer.email}.` });
            setIsOfferLetterDialogOpen(false); 
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Email error:', error);
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
      margin: [10,10,10,10], filename, image: {type: 'jpeg', quality: 0.98}, html2canvas: {scale: 2, useCORS: true, width: documentToCapture.scrollWidth, windowWidth: documentToCapture.scrollWidth}, jsPDF: {unit: 'mm', format: 'a4', orientation: 'portrait'}};
     html2pdf().from(documentToCapture).set(opt).save()
      .then(() => toast({ title: "PDF Downloaded", description: "Offer letter saved." }))
      .catch(err => { console.error(err); toast({ title: "PDF Error", description: "Failed to generate PDF.", variant: "destructive" }); })
      .finally(() => document.body.removeChild(tempElement));
  };

  const handleUpdateApplicantStatus = (applicantId, newStatus) => {
    updateApplicant(applicantId, { offerStatus: newStatus });
    toast({ title: "Status Updated", description: `Applicant status changed to ${formatOfferStatus(newStatus)}.` });
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
        updateApplicant(selectedApplicantForOnboarding.id, { offerStatus: "HIRED" });
        toast({ title: "Employee Onboarded & Joining Letter Generated", description: `${newEmployeeBase.name} added. Preview letter.` });
        setIsJoiningLetterPreviewOpen(true); 
      } else {
        throw new Error("Failed to generate joining letter content.");
      }
    } catch (error) {
      console.error("Error generating joining letter:", error);
      toast({ title: "Joining Letter Failed", description: error.message, variant: "destructive" });
      addEmployee(newEmployeeBase);
      updateApplicant(selectedApplicantForOnboarding.id, { offerStatus: "HIRED" });
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
  const STATUS_OPTIONS = ["Active", "On Leave", "Terminated", "Probation", "Resigned"];

  const handleOpenNoteDialog = (applicant) => {
    setNoteApplicant(applicant);
    setSelectedNote("");
    setCustomNote("");
    setNoteDialogOpen(true);
  };

  const handleAddNote = () => {
    if (!noteApplicant) return;
    const noteText = selectedNote === "Other" ? customNote : selectedNote;
    if (noteText && noteText.trim() !== "") {
      addNoteToApplicant(noteApplicant.id, noteText.trim());
      setNoteDialogOpen(false);
      setSelectedNote("");
      setCustomNote("");
    }
  };

  // Add file handling functions
  const handleResumeFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedResumeFile(file);
    }
  };

  const handleRemoveResumeFile = () => {
    setSelectedResumeFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Update the Resume Upload Dialog
  <Dialog open={isResumeUploadDialogOpen} onOpenChange={setIsResumeUploadDialogOpen}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Upload Resume for {selectedApplicantForResume?.name}</DialogTitle>
        <DialogDescription>
          Upload a resume for this applicant. Supported formats: PDF, DOC, DOCX
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <div className="flex items-center gap-2">
          {selectedResumeFile ? (
            <div className="flex items-center justify-between w-full rounded-md border border-input p-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="truncate" title={selectedResumeFile.name}>{selectedResumeFile.name}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemoveResumeFile}
                className="h-6 w-6 text-destructive hover:bg-destructive/10"
              >
                <XCircle className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload Resume
            </Button>
          )}
          <Input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleResumeFileChange}
            accept=".pdf,.doc,.docx"
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Supported formats: PDF, DOC, DOCX
        </p>
      </div>
      <DialogFooter className="gap-2">
        <Button 
          variant="outline" 
          onClick={() => {
            setIsResumeUploadDialogOpen(false);
            setSelectedApplicantForResume(null);
            setSelectedResumeFile(null);
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={() => selectedResumeFile && handleUploadResume(selectedResumeFile)}
          disabled={!selectedResumeFile || isUploadingResume}
        >
          {isUploadingResume ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload'
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  // Update handleUploadResume to use the selected file
  const handleUploadResume = async (file) => {
    if (!selectedApplicantForResume) return;
    
    setIsUploadingResume(true);
    try {
      const { data: presignedData } = await s3Service.getPresignedUrl(
        file.name,
        file.type
      );
      await s3Service.uploadFileDirectly(file, presignedData.presignedUrl);
      
      const result = await updateApplicant(selectedApplicantForResume.id, {
        resumeLink: presignedData.url
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Resume uploaded successfully"
        });
        setIsResumeUploadDialogOpen(false);
        setSelectedApplicantForResume(null);
        setSelectedResumeFile(null);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload resume",
        variant: "destructive"
      });
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleAddApplicant = async (data) => {
    try {
      const result = await addApplicant({
        ...data,
        jobPostingId: selectedJobId,
        offerStatus: "PENDING_OFFER",
        assertifyScore: data.assertifyScore || 0,
        resumeLink: data.resumeLink || null
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Applicant added successfully"
        });
        setAddDialogOpen(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add applicant",
        variant: "destructive"
      });
    }
  };

  console.log("jobs name",selectedApplicantForOffer,jobs, jobs?.find(j => j.id === selectedApplicantForOffer?.jobPostingId)?.title);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Mail className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Manage Offers & Onboarding</CardTitle>
            </div>
            <Button onClick={() => setAddDialogOpen(true)} variant="default">
              Add Applicant
            </Button>
          </div>
          <CardDescription>
            Select a job to view applicants, generate offer letters, and onboard candidates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(jobLoading || applicantLoading) ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading data...</span>
            </div>
          ) : (
            <>
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
                          {job.title} ({typeof job.department === 'object' ? job.department.name : job.department})
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
                          {status === "All" ? "All" : formatOfferStatus(status)}
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
                      <TableHead>Latest Note</TableHead>
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
                              {applicant.resumeLink ? (
                                <a 
                                  href={applicant.resumeLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-primary hover:underline"
                                >
                            View Resume
                          </a>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedApplicantForResume(applicant);
                                    setIsResumeUploadDialogOpen(true);
                                  }}
                                >
                                  Upload Resume
                                </Button>
                              )}
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
                                    <SelectItem key={opt} value={opt}>{formatOfferStatus(opt)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                           <Badge variant={statusVariantMap[applicant.offerStatus] || "outline"} className="mt-1 text-xs">
                                 {formatOfferStatus(applicant.offerStatus)}
                           </Badge>
                        </TableCell>
                        <TableCell>
                          {applicant.notes && applicant.notes.length > 0 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="max-w-xs truncate cursor-pointer font-medium"
                                  title={applicant.notes[applicant.notes.length - 1].text}
                                  onClick={() => handleOpenNoteDialog(applicant)}
                                >
                                  {applicant.notes[applicant.notes.length - 1].text}
                                  <span className="ml-1 text-xs text-muted-foreground">
                                    ({format(new Date(applicant.notes[applicant.notes.length - 1].date), "MMM d, yyyy")})
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {applicant.notes[applicant.notes.length - 1].text}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="space-x-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-5 w-5" />
                          </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                  {(applicant.offerStatus === "SELECTED" || applicant.offerStatus === "OFFER_GENERATED" || applicant.offerStatus === "OFFER_SENT") && (
                                <DropdownMenuItem onClick={() => handleOpenOfferLetterDialog(applicant)}>
                                  Offer
                                </DropdownMenuItem>
                              )}
                                  {applicant.offerStatus?.trim() === "OFFER_ACCEPTED" && (
                                <DropdownMenuItem onClick={() => handleOpenOnboardingForm(applicant)}>
                                  Onboard
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => { setHistoryApplicant(applicant); setHistoryDialogOpen(true); }}>
                                View History
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenNoteDialog(applicant)}>
                                Note
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
            </>
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
                    positionTitle: jobs?.find(j => j.id === selectedApplicantForOffer?.jobPostingId)?.title || "",
                    department: jobs?.find(j => j.id === selectedApplicantForOffer?.jobPostingId)?.department?.name || "",
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
              initialData={selectedApplicantForOnboarding ? (() => {
                const job = jobs.find(j => j.id === selectedApplicantForOnboarding.jobPostingId);
                // Find departmentId from store by department name or id
                let departmentId = "";
                if (job?.department.id) {
                  departmentId = job.department.id;
                } else if (job?.department && typeof job.department === 'string') {
                  const dept = departments.find(d => d.name === job.department.title);
                  if (dept) departmentId = dept.id;
                } else if (job?.department && typeof job.department === 'object' && job.department.id) {
                  departmentId = job.department.id;
                }
                return {
                name: selectedApplicantForOnboarding.name, 
                email: selectedApplicantForOnboarding.email,
                  role: job?.role || 'EMPLOYEE',
                  designation: job?.designation || 'INTERN',
                  department: departmentId,
                  joinDate: selectedApplicantForOnboarding.offeredStartDate
                    ? (typeof selectedApplicantForOnboarding.offeredStartDate === 'string'
                        ? new Date(selectedApplicantForOnboarding.offeredStartDate)
                        : selectedApplicantForOnboarding.offeredStartDate)
                    : new Date(),
                  status: 'PROBATION',
                  salary: selectedApplicantForOnboarding.offeredSalary || '',
                  employeeType: job?.employeeType || 'FULL_TIME',
                  gender: 'OTHER',
                  reportingManagerId: job?.projectManager?.id || '',
                };
              })() : {}}
              onCancel={() => setIsJoiningFormOpen(false)}
              rolesOptions={["SUPERADMIN", "ADMIN", "MANAGER", "HR", "ACCOUNTS", "EMPLOYEE"]}
              designationOptions={["INTERN","TRAINEE","JUNIOR_DEVELOPER","ASSOCIATE_DEVELOPER","DEVELOPER","SENIOR_DEVELOPER","TEAM_LEAD","PRINCIPAL_ENGINEER","JUNIOR_DESIGNER","DESIGNER","SENIOR_DESIGNER","HR_EXECUTIVE","SENIOR_HR","SALES_REP","SENIOR_SALES_REP","ANALYST","SENIOR_ANALYST","ASSOCIATE_QA","QA_ENGINEER","SENIOR_QA","DEVOPS_ENGINEER_DESIGNATION","SENIOR_DEVOPS_ENGINEER","PRODUCT_MANAGER","SENIOR_PRODUCT_MANAGER","MANAGER_DESIGNATION","DIRECTOR","ADMINISTRATOR","ACCOUNTANT_DESIGNATION"]}
              departmentsOptions={departments.map(dept => ({ id: dept.id, value: dept.id, label: dept.name }))}
              statusOptions={["ACTIVE", "ON_LEAVE", "TERMINATED", "PROBATION", "RESIGNED"]}
              employeeTypeOptions={["FULL_TIME", "PART_TIME", "CONTRACTOR", "INTERN", "TEMPORARY"]}
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

      {/* Offer History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Offer Process History for {historyApplicant?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {historyApplicant && <OfferHistory history={historyApplicant.offerHistory || []} />}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notes for {noteApplicant?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <div>
              <div className="font-semibold mb-1">Existing Notes:</div>
              {noteApplicant?.notes?.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {noteApplicant.notes.map((n, idx) => (
                    <li key={idx} className="text-sm">
                      <span>{n.text}</span>
                      <span className="ml-2 text-xs text-muted-foreground">({format(new Date(n.date), "MMM d, yyyy h:mm a")})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-muted-foreground">No notes yet.</div>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">Add Note:</label>
              <select
                className="w-full border rounded px-2 py-1 mb-2"
                value={selectedNote}
                onChange={e => setSelectedNote(e.target.value)}
              >
                <option value="">Select a note</option>
                {predefinedNotes.map((note, idx) => (
                  <option key={idx} value={note}>{note}</option>
                ))}
              </select>
              {selectedNote === "Other" && (
                <input
                  className="w-full border rounded px-2 py-1 mt-1"
                  value={customNote}
                  onChange={e => setCustomNote(e.target.value)}
                  placeholder="Enter custom note"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddNote} disabled={!selectedNote || (selectedNote === "Other" && !customNote.trim())}>Add Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Applicant Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-lg md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Applicant</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new applicant to the selected job.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[70vh] overflow-y-auto pr-2">
            <ApplicantForm
              onSubmit={handleAddApplicant}
              onCancel={() => setAddDialogOpen(false)}
              jobOptions={jobs}
            />
          </div>
            </DialogContent>
        </Dialog>

      {/* Resume Upload Dialog */}
      <Dialog open={isResumeUploadDialogOpen} onOpenChange={setIsResumeUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Resume for {selectedApplicantForResume?.name}</DialogTitle>
            <DialogDescription>
              Upload a resume for this applicant. Supported formats: PDF, DOC, DOCX
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2">
              {selectedResumeFile ? (
                <div className="flex items-center justify-between w-full rounded-md border border-input p-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="truncate" title={selectedResumeFile.name}>{selectedResumeFile.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveResumeFile}
                    className="h-6 w-6 text-destructive hover:bg-destructive/10"
                  >
                    <XCircle className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Resume
                </Button>
              )}
              <Input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleResumeFileChange}
                accept=".pdf,.doc,.docx"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Supported formats: PDF, DOC, DOCX
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsResumeUploadDialogOpen(false);
                setSelectedApplicantForResume(null);
                setSelectedResumeFile(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => selectedResumeFile && handleUploadResume(selectedResumeFile)}
              disabled={!selectedResumeFile || isUploadingResume}
            >
              {isUploadingResume ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}

