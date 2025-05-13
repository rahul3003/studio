
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
import { generateJoiningLetter } from "@/ai/flows/generate-joining-letter-flow";
import { sendJoiningLetterEmail } from "@/ai/flows/send-joining-letter-email-flow";
import html2pdf from 'html2pdf.js';
import { format } from "date-fns";


const statusVariantMap = {
  Active: "default",
  "On Leave": "secondary",
  Terminated: "destructive",
  Probation: "outline", // Added Probation
  Resigned: "destructive" // Added Resigned
};

const ROLES_OPTIONS = ["Software Engineer", "Project Manager", "UX Designer", "HR Specialist", "Frontend Developer", "Sales Executive", "Marketing Manager", "Data Analyst", "QA Engineer", "DevOps Engineer", "Product Owner", "Business Analyst", "System Administrator", "Operations Head", "Accountant"];
const DESIGNATION_OPTIONS = ["Intern", "Trainee", "Junior Developer", "Associate Developer", "Developer", "Senior Developer", "Team Lead", "Principal Engineer", "Junior Designer", "Designer", "Senior Designer", "HR Executive", "Senior HR", "Sales Rep", "Senior Sales Rep", "Analyst", "Senior Analyst", "Associate QA", "QA Engineer", "Senior QA", "DevOps Engineer", "Senior DevOps", "Product Manager", "Senior Product Manager", "Manager", "Director", "Administrator", "Accountant"];
const DEPARTMENTS_OPTIONS = ["Technology", "Operations", "Design", "Human Resources", "Sales", "Marketing", "Finance", "Product", "Quality Assurance", "IT", "Administration"];
const STATUS_OPTIONS = ["Active", "On Leave", "Terminated", "Probation", "Resigned"];

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
      const newId = `EMP${String(Date.now()).slice(-4)}${String(employees.length + 1).padStart(3, '0')}`;
      const newEmployee = {
        ...employeeData,
        id: newId,
        avatarUrl: `https://i.pravatar.cc/150?u=${employeeData.email || newId}`,
        gender: employeeData.gender || "Other", 
        joiningLetterHtml: null, // Initialize with null
      };
      addEmployee(newEmployee);
      toast({ title: "Employee Added", description: `${employeeData.name} has been added.` });
      handleDialogClose();

      // Generate Joining Letter for new employee
      setIsGeneratingLetter(true);
      setCurrentEmployeeForLetter(newEmployee);
      try {
        const joiningLetterInput = {
          employeeName: newEmployee.name,
          employeeEmail: newEmployee.email,
          positionTitle: newEmployee.role, // Assuming 'role' is position title
          department: newEmployee.department,
          startDate: format(new Date(newEmployee.joinDate), "MMMM d, yyyy"), // Format date for prompt
          salary: newEmployee.salary || "As per discussion",
          employeeType: newEmployee.employeeType,
          companyName: "PESU Venture Labs", // Or from a config/store
          companyAddress: "PESU Venture Labs, PES University, 100 Feet Ring Road, Banashankari Stage III, Bengaluru, Karnataka 560085",
          // reportingManager: newEmployee.reportingManager || "To be assigned", // Add if this field exists in employeeData
        };
        const result = await generateJoiningLetter(joiningLetterInput);
        if (result?.joiningLetterHtml) {
          setGeneratedJoiningLetterHtml(result.joiningLetterHtml);
          updateEmployee({ ...newEmployee, joiningLetterHtml: result.joiningLetterHtml }); // Save letter HTML to store
          toast({ title: "Joining Letter Generated", description: "Preview available." });
          setIsJoiningLetterPreviewOpen(true);
        } else {
          throw new Error("AI failed to generate joining letter content.");
        }
      } catch (error) {
        console.error("Error generating joining letter:", error);
        toast({ title: "Letter Generation Failed", description: error.message, variant: "destructive" });
      } finally {
        setIsGeneratingLetter(false);
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
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } // Changed to A4
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
      const result = await sendJoiningLetterEmail({
        employeeEmail: currentEmployeeForLetter.email,
        employeeName: currentEmployeeForLetter.name,
        joiningLetterHtml: generatedJoiningLetterHtml,
        companyName: "PESU Venture Labs",
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
                  <TableHead>Type</TableHead> {/* Added Type column */}
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
                    <TableCell>{employee.employeeType}</TableCell> {/* Display Type */}
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
              employeeTypeOptions={EMPLOYEE_TYPE_OPTIONS} // Pass type options
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
