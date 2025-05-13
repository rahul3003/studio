
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Users, FileText, UserPlus, Send, CheckCircle, XCircle, Briefcase, Loader2, Eye, UserCheck, UserX } from "lucide-react";

import { useJobStore } from "@/store/jobStore";
import { useApplicantStore } from "@/store/applicantStore";
import { useEmployeeStore } from "@/store/employeeStore";
import { OfferLetterForm } from "@/components/document/offer-letter-form";
import { EmployeeForm } from "@/components/employee/employee-form"; 
import { generateOfferLetter } from "@/ai/flows/generate-offer-letter-flow";
import { sendOfferLetterEmail } from "@/ai/flows/send-offer-letter-email-flow"; 
import { format, addDays, parseISO } from "date-fns";

const ROLES_OPTIONS_EMPLOYEE = ["Software Engineer", "Project Manager", "UX Designer", "HR Specialist", "Frontend Developer", "Sales Executive", "Marketing Manager", "Data Analyst", "QA Engineer", "DevOps Engineer", "Product Owner", "Business Analyst", "System Administrator", "Operations Head", "Accountant"];
const DESIGNATION_OPTIONS_EMPLOYEE = ["Intern", "Trainee", "Junior Developer", "Associate Developer", "Developer", "Senior Developer", "Team Lead", "Principal Engineer", "Junior Designer", "Designer", "Senior Designer", "HR Executive", "Senior HR", "Sales Rep", "Senior Sales Rep", "Analyst", "Senior Analyst", "Associate QA", "QA Engineer", "Senior QA", "DevOps Engineer", "Senior DevOps", "Product Manager", "Senior Product Manager", "Manager", "Director", "Administrator", "Accountant"];
const DEPARTMENTS_OPTIONS_EMPLOYEE = ["Technology", "Operations", "Design", "Human Resources", "Sales", "Marketing", "Finance", "Product", "Quality Assurance", "IT", "Administration"];
const STATUS_OPTIONS_EMPLOYEE = ["Active", "On Leave", "Terminated", "Probation", "Resigned"];

export default function OffersPage() {
  const { toast } = useToast();
  const jobs = useJobStore((state) => state.jobs);
  const initializeJobs = useJobStore((state) => state._initializeJobs);

  const applicants = useApplicantStore((state) => state.applicants);
  const getApplicantsByJobId = useApplicantStore((state) => state.getApplicantsByJobId);
  const updateApplicant = useApplicantStore((state) => state.updateApplicant);
  const initializeApplicants = useApplicantStore((state) => state._initializeApplicants);

  const addEmployee = useEmployeeStore((state) => state.addEmployee);


  const [selectedJobId, setSelectedJobId] = React.useState("");
  const [filteredApplicants, setFilteredApplicants] = React.useState([]);
  
  const [selectedApplicant, setSelectedApplicant] = React.useState(null);
  const [offerFormInitialData, setOfferFormInitialData] = React.useState(null);
  const [isOfferFormOpen, setIsOfferFormOpen] = React.useState(false);
  const [isViewOfferOpen, setIsViewOfferOpen] = React.useState(false);
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = React.useState(false);
  
  const [generatedOfferHtml, setGeneratedOfferHtml] = React.useState("");
  const [isGeneratingOffer, setIsGeneratingOffer] = React.useState(false);
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);

  React.useEffect(() => {
    initializeJobs();
    initializeApplicants();
  }, [initializeJobs, initializeApplicants]);

  React.useEffect(() => {
    if (selectedJobId) {
      setFilteredApplicants(getApplicantsByJobId(selectedJobId));
    } else {
      setFilteredApplicants([]);
    }
  }, [selectedJobId, applicants, getApplicantsByJobId]);

  const handleJobChange = (jobId) => {
    setSelectedJobId(jobId);
  };

  const handleMarkApplicantSelected = (applicantId) => {
    updateApplicant(applicantId, { offerStatus: 'Selected' });
    toast({ title: "Applicant Selected", description: "Applicant marked as selected for offer." });
  };

  const handleMarkApplicantRejectedApp = (applicantId) => {
    updateApplicant(applicantId, { offerStatus: 'Rejected (Application)' });
    toast({ title: "Applicant Rejected", description: "Applicant marked as rejected at application stage.", variant: "destructive" });
  };

  const handleOpenOfferForm = (applicant) => {
    const job = jobs.find(j => j.id === selectedJobId);
    if (!job) {
        toast({title: "Error", description: "Selected job not found.", variant: "destructive"});
        return;
    }
    setSelectedApplicant(applicant);
    setGeneratedOfferHtml(""); 
    setOfferFormInitialData({
        candidateName: applicant.name,
        candidateEmail: applicant.email,
        positionTitle: job.title,
        department: job.department,
        companyName: job.companyName || "PESU Venture Labs",
        // Sensible defaults for dates, salary will be set by form
        startDate: format(addDays(new Date(), 14), "yyyy-MM-dd"), // Default start date 2 weeks from now
        offerExpiryDate: format(addDays(new Date(), 7), "yyyy-MM-dd"), // Default expiry 1 week from now
        salary: applicant.offeredSalary || job.salaryRange || "₹ Discussed Amount per annum", // Use applicant's offered if available, then job, then placeholder
    });
    setIsOfferFormOpen(true);
  };
  
  const handleViewOffer = (applicant) => {
    setSelectedApplicant(applicant);
    setGeneratedOfferHtml(applicant.offerLetterHtml || "");
    setIsViewOfferOpen(true);
  };

  const handleGenerateOfferSubmit = async (offerDataFromForm) => {
    if (!selectedApplicant || !selectedJobId) return;
    
    setIsGeneratingOffer(true);
    try {
        // offerDataFromForm already contains formatted dates (MMMM d, yyyy) and all necessary fields from OfferLetterForm
      const result = await generateOfferLetter(offerDataFromForm);
      if (result && result.offerLetterText) {
        setGeneratedOfferHtml(result.offerLetterText);
        updateApplicant(selectedApplicant.id, { 
          offerStatus: 'Offer Generated', 
          offerLetterHtml: result.offerLetterText,
          offeredSalary: offerDataFromForm.salary, // Store the salary from the form
          offeredStartDate: offerDataFromForm.startDate, // Store MMMM d, yyyy formatted date
        });
        toast({ title: "Offer Generated", description: `Offer letter for ${selectedApplicant.name} created.` });
      } else {
        throw new Error("Failed to generate offer letter content.");
      }
    } catch (error) {
      console.error("Error generating offer:", error);
      toast({ title: "Offer Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGeneratingOffer(false);
    }
  };
  
  const handleSendOfferEmail = async () => {
    if (!selectedApplicant || !generatedOfferHtml) {
        toast({title: "Error", description: "No applicant or offer letter to send.", variant: "destructive"});
        return;
    }
    setIsSendingEmail(true);
    try {
        const job = jobs.find(j => j.id === selectedApplicant.jobId);
        await sendOfferLetterEmail({
            candidateEmail: selectedApplicant.email,
            candidateName: selectedApplicant.name,
            offerLetterHtml: generatedOfferHtml,
            companyName: job?.companyName || "PESU Venture Labs",
        });
        updateApplicant(selectedApplicant.id, { offerStatus: 'Offer Sent' });
        toast({title: "Offer Sent", description: `Offer letter emailed to ${selectedApplicant.name}.`});
        setIsOfferFormOpen(false); 
        setGeneratedOfferHtml("");
        setSelectedApplicant(null);
        setOfferFormInitialData(null);
    } catch (error) {
        console.error("Error sending email:", error);
        toast({title: "Email Failed", description: error.message, variant: "destructive"});
    } finally {
        setIsSendingEmail(false);
    }
  };

  const handleMarkOfferAccepted = (applicantId) => {
    updateApplicant(applicantId, { offerStatus: 'Offer Accepted' });
    toast({ title: "Offer Accepted", description: "Applicant marked as accepted." });
  };
  
  const handleMarkOfferRejected = (applicantId) => {
    updateApplicant(applicantId, { offerStatus: 'Offer Rejected (Offer)' });
    toast({ title: "Offer Rejected", description: "Applicant marked as rejected the offer." });
  };

  const handleOpenEmployeeForm = (applicant) => {
    setSelectedApplicant(applicant);
    setIsEmployeeFormOpen(true);
  };

  const handleCreateEmployee = (employeeData) => {
    if (!selectedApplicant) return;
    
    const newEmployee = {
        ...employeeData,
        // Employee store will handle ID generation and avatar.
        // Salary information is usually managed separately (e.g. in remuneration/payroll)
        // For this example, it's assumed EmployeeForm collected necessary fields
        // and employeeData contains those.
        // If salary needs to be explicitly passed, it would be from selectedApplicant.offeredSalary
    };

    addEmployee(newEmployee); 
    updateApplicant(selectedApplicant.id, { offerStatus: 'Hired' });
    toast({ title: "Employee Created", description: `${employeeData.name} added to employees.` });
    setIsEmployeeFormOpen(false);
    setSelectedApplicant(null);
  };


  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Pending': return 'secondary';
      case 'Selected': return 'outline';
      case 'Offer Generated': return 'default';
      case 'Offer Sent': return 'default';
      case 'Offer Accepted': return 'default'; 
      case 'Offer Rejected (Application)': return 'destructive';
      case 'Offer Rejected (Offer)': return 'destructive';
      case 'Hired': return 'default'; 
      default: return 'secondary';
    }
  };


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Manage Job Offers</CardTitle>
          </div>
          <CardDescription>
            Select a job to view applicants, manage statuses, generate offers, and onboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="job-select">Select Job Posting</Label>
            <Select value={selectedJobId} onValueChange={handleJobChange}>
              <SelectTrigger id="job-select" className="w-full md:w-[400px] mt-1">
                <SelectValue placeholder="Select a job..." />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title} ({job.department}) - {job.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedJobId && (
            <>
              <h3 className="text-xl font-semibold mb-3">
                Applicants for: {jobs.find(j => j.id === selectedJobId)?.title}
              </h3>
              {filteredApplicants.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Assertify (%)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplicants.map((applicant) => (
                        <TableRow key={applicant.id}>
                          <TableCell className="font-medium">{applicant.name}</TableCell>
                          <TableCell>{applicant.email}</TableCell>
                          <TableCell>{applicant.assertifyScore}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(applicant.offerStatus)}>
                              {applicant.offerStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            {applicant.offerStatus === 'Pending' && (
                                <>
                                <Button variant="outline" size="sm" onClick={() => handleMarkApplicantSelected(applicant.id)}>
                                    <UserCheck className="mr-1 h-4 w-4" /> Mark Selected
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleMarkApplicantRejectedApp(applicant.id)}>
                                    <UserX className="mr-1 h-4 w-4" /> Reject
                                </Button>
                                </>
                            )}
                            {applicant.offerStatus === 'Selected' && (
                              <Button variant="default" size="sm" onClick={() => handleOpenOfferForm(applicant)}>
                                <FileText className="mr-1 h-4 w-4" /> Generate Offer
                              </Button>
                            )}
                            {(applicant.offerStatus === 'Offer Generated' || applicant.offerStatus === 'Offer Sent' || applicant.offerStatus === 'Offer Accepted') && applicant.offerLetterHtml && (
                               <Button variant="outline" size="sm" onClick={() => handleViewOffer(applicant)}>
                                <Eye className="mr-1 h-4 w-4" /> View Offer
                              </Button>
                            )}
                            {applicant.offerStatus === 'Offer Sent' && (
                                <>
                                <Button variant="default" size="sm" onClick={() => handleMarkOfferAccepted(applicant.id)} className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="mr-1 h-4 w-4" /> Mark Accepted
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleMarkOfferRejected(applicant.id)}>
                                    <XCircle className="mr-1 h-4 w-4" /> Mark Rejected
                                </Button>
                                </>
                            )}
                            {applicant.offerStatus === 'Offer Accepted' && (
                              <Button variant="default" size="sm" onClick={() => handleOpenEmployeeForm(applicant)} className="bg-blue-600 hover:bg-blue-700">
                                <UserPlus className="mr-1 h-4 w-4" /> Onboard Employee
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground">No applicants found for this job.</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Generate/Edit Offer Dialog */}
      <Dialog open={isOfferFormOpen} onOpenChange={(open) => { if(!open) {setIsOfferFormOpen(false); setOfferFormInitialData(null); setSelectedApplicant(null); setGeneratedOfferHtml(""); } else {setIsOfferFormOpen(true); }}}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Offer Letter for {selectedApplicant?.name}</DialogTitle>
            <DialogDescription>
              Fill in the offer details. The generated letter will be shown below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[70vh] overflow-y-auto pr-2 space-y-4">
            {offerFormInitialData && 
              <OfferLetterForm 
                onSubmit={handleGenerateOfferSubmit} 
                isLoading={isGeneratingOffer}
                initialData={offerFormInitialData}
              />
            }
            {isGeneratingOffer && (
                <div className="flex items-center justify-center p-4">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                    <p className="text-muted-foreground">Generating offer letter...</p>
                </div>
            )}
            {generatedOfferHtml && !isGeneratingOffer && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Offer Letter Preview</h3>
                <div 
                  className="p-4 border rounded-md bg-white shadow-sm overflow-auto max-h-[40vh] prose prose-sm max-w-none dark:bg-slate-900 dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: generatedOfferHtml }}
                />
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => {setIsOfferFormOpen(false); setOfferFormInitialData(null); setSelectedApplicant(null); setGeneratedOfferHtml("");}}>Cancel</Button>
                    <Button onClick={handleSendOfferEmail} disabled={isSendingEmail}>
                        {isSendingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                        {isSendingEmail ? "Sending..." : "Send Offer via Email"}
                    </Button>
                </DialogFooter>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* View Offer Dialog */}
      <Dialog open={isViewOfferOpen} onOpenChange={setIsViewOfferOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Offer Letter for {selectedApplicant?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-[70vh] overflow-y-auto pr-2">
             {generatedOfferHtml && (
                <div 
                  className="p-4 border rounded-md bg-white shadow-sm overflow-auto prose prose-sm max-w-none dark:bg-slate-900 dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: generatedOfferHtml }}
                />
             )}
          </div>
            <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsViewOfferOpen(false)}>Close</Button>
                 {selectedApplicant?.offerStatus === 'Offer Generated' && (
                    <Button onClick={handleSendOfferEmail} disabled={isSendingEmail}>
                        {isSendingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                        {isSendingEmail ? "Sending..." : "Send Offer via Email"}
                    </Button>
                 )}
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Employee Dialog */}
      <Dialog open={isEmployeeFormOpen} onOpenChange={setIsEmployeeFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Onboard {selectedApplicant?.name} as New Employee</DialogTitle>
            <DialogDescription>
              Confirm and complete the details for the new employee.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[70vh] overflow-y-auto pr-2">
            {selectedApplicant && jobs.find(j => j.id === selectedApplicant.jobId) && (
              <EmployeeForm
                onSubmit={handleCreateEmployee}
                onCancel={() => setIsEmployeeFormOpen(false)}
                initialData={{
                  name: selectedApplicant.name,
                  email: selectedApplicant.email,
                  role: jobs.find(j => j.id === selectedApplicant.jobId)?.title, 
                  designation: "", // To be selected in form
                  department: jobs.find(j => j.id === selectedApplicant.jobId)?.department, 
                  joinDate: selectedApplicant.offeredStartDate ? new Date(selectedApplicant.offeredStartDate) : new Date(), 
                  status: "Probation", 
                }}
                rolesOptions={ROLES_OPTIONS_EMPLOYEE}
                designationOptions={DESIGNATION_OPTIONS_EMPLOYEE}
                departmentsOptions={DEPARTMENTS_OPTIONS_EMPLOYEE}
                statusOptions={STATUS_OPTIONS_EMPLOYEE}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

