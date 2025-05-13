
"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, Users as UsersIcon, Loader2, Download, Mail, FileText as FileTextIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmployeeForm, EMPLOYEE_TYPE_OPTIONS } from "@/components/employee/employee-form";
import { useEmployeeStore } from "@/store/employeeStore";
import { sendEmail } from '@/services/emailService'; // Import direct email service
import html2pdf from 'html2pdf.js';
import { format } from "date-fns";

const statusVariantMap = {
  Active: "default",
  "On Leave": "secondary",
  Terminated: "destructive",
  Probation: "outline",
  Resigned: "destructive"
};

const ROLES_OPTIONS = ["Software Engineer", "Project Manager", "UX Designer", "HR Specialist", "Frontend Developer", "Sales Executive", "Marketing Manager", "Data Analyst", "QA Engineer", "DevOps Engineer", "Product Owner", "Business Analyst", "System Administrator", "Operations Head", "Accountant"];
const DESIGNATION_OPTIONS = ["Intern", "Trainee", "Junior Developer", "Associate Developer", "Developer", "Senior Developer", "Team Lead", "Principal Engineer", "Junior Designer", "Designer", "Senior Designer", "HR Executive", "Senior HR", "Sales Rep", "Senior Sales Rep", "Analyst", "Senior Analyst", "Associate QA", "QA Engineer", "Senior QA", "DevOps Engineer", "Senior DevOps", "Product Manager", "Senior Product Manager", "Manager", "Director", "Administrator", "Accountant"];
const DEPARTMENTS_OPTIONS = ["Technology", "Operations", "Design", "Human Resources", "Sales", "Marketing", "Finance", "Product", "Quality Assurance", "IT", "Administration"];
const STATUS_OPTIONS = ["Active", "On Leave", "Terminated", "Probation", "Resigned"];

// Placeholder HTML generation function for Joining Letter
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
</div>
  `;
};


export default function EmployeesPage() {
  const { toast } = useToast();
  const employees = useEmployeeStore((state) => state.employees);
  const addEmployee = useEmployeeStore((state) => state.addEmployee);
  const updateEmployee = useEmployeeStore((state) => state.updateEmployee);
  const deleteEmployee = useEmployeeStore((state) => state.deleteEmployee);
  const initializeEmployees = useEmployeeStore((state) => state._initializeEmployees);

  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState(null);

  const [isGeneratingLetter, setIsGeneratingLetter] = React.useState(false);
  const [isEmailingLetter, setIsEmailingLetter] = React.useState(false);
  const [generatedJoiningLetterHtml, setGeneratedJoiningLetterHtml] = React.useState("");
  const [currentEmployeeForLetter, setCurrentEmployeeForLetter] = React.useState(null);
  const [isJoiningLetterPreviewOpen, setIsJoiningLetterPreviewOpen] = React.useState(false);
  
  React.useEffect(() => {
    initializeEmployees(); 
  }, [initializeEmployees]);

  const handleAddEmployeeOpen = () => {
    setSelectedEmployee(null); 
    setIsAddDialogOpen(true);
  };

  const handleEditEmployeeOpen = (employee) => {
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const handleDeleteEmployeeOpen = (employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleJoiningLetterDialogClose = () => {
    setIsJoiningLetterPreviewOpen(false);
    setGeneratedJoiningLetterHtml("");
    setCurrentEmployeeForLetter(null);
  };

  const handleSaveEmployee = async (employeeData) => {
    if (selectedEmployee && selectedEmployee.id) {
      // Editing existing employee
      updateEmployee({ ...employeeData, avatarUrl: `https://i.pravatar.cc/150?u=${employeeData.email || selectedEmployee.id}` });
      toast({ title: "Employee Updated", description: `${employeeData.name}'s details have been updated.` });
      handleDialogClose();
    } else {
      // Adding new employee
      setIsGeneratingLetter(true); // Set loading state for letter generation
      const newId = `EMP${String(Date.now()).slice(-4)}${String(employees.length + 1).padStart(3, '0')}`;
      const newEmployeeBase = {
        ...employeeData,
        id: newId,
        avatarUrl: `https://i.pravatar.cc/150?u=${employeeData.email || newId}`,
        gender: employeeData.gender || "Other", 
      };
      
      setCurrentEmployeeForLetter(newEmployeeBase); // For dialog title

      try {
        const joiningLetterInput = {
          employeeName: newEmployeeBase.name,
          employeeEmail: newEmployeeBase.email,
          positionTitle: newEmployeeBase.role, 
          department: newEmployeeBase.department,
          startDate: format(new Date(newEmployeeBase.joinDate), "MMMM d, yyyy"), 
          salary: newEmployeeBase.salary || "As per discussion",
          employeeType: newEmployeeBase.employeeType,
          companyName: "PESU Venture Labs",
          companyAddress: "PESU Venture Labs, PES University, 100 Feet Ring Road, Banashankari Stage III, Bengaluru, Karnataka 560085",
          reportingManager: newEmployeeBase.reportingManager || "To be assigned",
        };
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate generation delay
        const htmlContent = generatePlaceholderJoiningLetterHtml(joiningLetterInput);
        
        if (htmlContent) {
          setGeneratedJoiningLetterHtml(htmlContent);
          const newEmployeeWithLetter = { ...newEmployeeBase, joiningLetterHtml: htmlContent };
          addEmployee(newEmployeeWithLetter);
          toast({ title: "Employee Added & Joining Letter Generated", description: `${newEmployeeBase.name} added. Preview letter.` });
          setIsJoiningLetterPreviewOpen(true);
        } else {
          throw new Error("Failed to generate joining letter content.");
        }
      } catch (error) {
        console.error("Error generating joining letter:", error);
        toast({ title: "Letter Generation Failed", description: error.message, variant: "destructive" });
        // Still add employee without letter if generation fails
        addEmployee(newEmployeeBase); 
        toast({ title: "Employee Added (Letter Failed)", description: `${newEmployeeBase.name} added. Letter generation failed.`});
      } finally {
        setIsGeneratingLetter(false);
        handleDialogClose(); // Close the employee form dialog
      }
    }
  };

  const handleConfirmDelete = () => {
    if (selectedEmployee) {
      deleteEmployee(selectedEmployee.id);
      toast({ title: "Employee Deleted", description: `${selectedEmployee.name} has been removed.`, variant: "destructive" });
    }
    handleDialogClose();
  };

  const handleDownloadJoiningLetterPdf = () => {
    if (!generatedJoiningLetterHtml || !currentEmployeeForLetter) {
      toast({ title: "Error", description: "No joining letter content to download.", variant: "destructive" });
      return;
    }
    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute';
    tempElement.style.left = '-9999px';
    tempElement.style.top = '0px';
    tempElement.style.width = '1000px';
    tempElement.innerHTML = generatedJoiningLetterHtml;
    document.body.appendChild(tempElement);

    const documentToCapture = tempElement.querySelector('.joining-letter-container');
    if (!documentToCapture) {
      document.body.removeChild(tempElement);
      toast({ title: "PDF Error", description: "Could not find content for PDF.", variant: "destructive" });
      return;
    }
    const filename = `${currentEmployeeForLetter.name.replace(/ /g, '_')}_Joining_Letter.pdf`;
    const opt = {
      margin: [10, 10, 10, 10], filename, image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, width: documentToCapture.scrollWidth, windowWidth: documentToCapture.scrollWidth },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(documentToCapture).set(opt).save()
      .then(() => toast({ title: "PDF Downloaded", description: "Joining letter saved." }))
      .catch(err => toast({ title: "PDF Error", description: "Failed to generate PDF.", variant: "destructive" }))
      .finally(() => document.body.removeChild(tempElement));
  };

  const handleEmailJoiningLetter = async () => {
    if (!generatedJoiningLetterHtml || !currentEmployeeForLetter) {
      toast({ title: "Error", description: "No letter or employee data for email.", variant: "destructive" });
      return;
    }
    setIsEmailingLetter(true);
    try {
      const emailBody = `<p>Dear ${currentEmployeeForLetter.name},</p><p>Welcome to PESU Venture Labs! Please find your joining letter attached.</p><p>Sincerely,<br/>The PESU Venture Labs HR Team</p>`;
      const result = await sendEmail({
        to: currentEmployeeForLetter.email,
        subject: `Welcome to PESU Venture Labs - Your Joining Letter`,
        htmlBody: emailBody,
        attachments: [{
            filename: `${currentEmployeeForLetter.name.replace(/ /g, '_')}_Joining_Letter.html`,
            content: generatedJoiningLetterHtml,
            contentType: 'text/html',
        }]
      });
      if (result.success) {
        toast({ title: "Email Sent", description: `Joining letter sent to ${currentEmployeeForLetter.email}.` });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({ title: "Email Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsEmailingLetter(false);
    }
  };


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col gap-y-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
                <UsersIcon className="h-8 w-8 text-primary" />
                <CardTitle className="text-3xl">Manage Employees</CardTitle>
            </div>
            <CardDescription>
              View, add, edit, and manage employee information.
            </CardDescription>
          </div>
          <Button onClick={handleAddEmployeeOpen} className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Employee
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={employee.avatarUrl} alt={employee.name} data-ai-hint="person face"/>
                        <AvatarFallback>
                          {employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.role}</TableCell> 
                    <TableCell>{employee.designation}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.employeeType}</TableCell>
                    <TableCell>{employee.gender}</TableCell>
                    <TableCell>
                      {new Date(employee.joinDate).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariantMap[employee.status] || "outline"}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-1 hover:bg-accent/20"
                        onClick={() => handleEditEmployeeOpen(employee)}
                      >
                        <Edit className="h-4 w-4 text-primary" />
                        <span className="sr-only">Edit {employee.name}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-destructive/20"
                        onClick={() => handleDeleteEmployeeOpen(employee)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete {employee.name}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {employees.length === 0 && (
            <div className="py-10 text-center text-muted-foreground">
              No employees found. Click "Add New Employee" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Employee Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-lg md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
            <DialogDescription>
              {selectedEmployee ? "Update the details of the employee." : "Fill in the details to add a new employee."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[70vh] overflow-y-auto pr-2">
            <EmployeeForm
              onSubmit={handleSaveEmployee}
              initialData={selectedEmployee}
              onCancel={handleDialogClose}
              rolesOptions={ROLES_OPTIONS} 
              designationOptions={DESIGNATION_OPTIONS}
              departmentsOptions={DEPARTMENTS_OPTIONS}
              statusOptions={STATUS_OPTIONS}
              employeeTypeOptions={EMPLOYEE_TYPE_OPTIONS}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={handleDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <strong>{selectedEmployee?.name}</strong> and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDialogClose}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Joining Letter Preview Dialog */}
      <Dialog open={isJoiningLetterPreviewOpen} onOpenChange={handleJoiningLetterDialogClose}>
        <DialogContent className="sm:max-w-3xl lg:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Joining Letter Preview for {currentEmployeeForLetter?.name}</DialogTitle>
            <DialogDescription>
              Review the generated joining letter. You can download it as a PDF or email it directly.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[70vh] overflow-y-auto pr-2">
            {isGeneratingLetter && (
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Generating letter...</p>
              </div>
            )}
            {!isGeneratingLetter && generatedJoiningLetterHtml && (
              <div 
                className="p-4 border rounded-md bg-white shadow-sm overflow-auto prose prose-sm max-w-none dark:bg-slate-900 dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: generatedJoiningLetterHtml }}
              />
            )}
            {!isGeneratingLetter && !generatedJoiningLetterHtml && (
                 <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed rounded-md bg-muted/20">
                    <FileTextIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-lg text-muted-foreground">No letter generated or an error occurred.</p>
                 </div>
            )}
          </div>
          <DialogFooter className="mt-4 sm:justify-end gap-2">
            <Button variant="outline" onClick={handleJoiningLetterDialogClose}>Close</Button>
            <Button onClick={handleDownloadJoiningLetterPdf} disabled={!generatedJoiningLetterHtml || isGeneratingLetter || isEmailingLetter}>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
            <Button onClick={handleEmailJoiningLetter} disabled={!generatedJoiningLetterHtml || isGeneratingLetter || isEmailingLetter}>
              {isEmailingLetter ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              {isEmailingLetter ? "Sending..." : "Email Letter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
