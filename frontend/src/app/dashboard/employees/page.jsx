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
import { sendEmail } from '@/services/emailService'; 
import html2pdf from 'html2pdf.js';
import { format } from "date-fns";
import { useDepartmentStore } from '@/store/departmentStore';

// Import HTML generation function for Joining Letter
import { generatePlaceholderJoiningLetterHtml } from '@/lib/document-templates/joining-letter';


const statusVariantMap = {
  ACTIVE: "default",
  ON_LEAVE: "secondary",
  TERMINATED: "destructive",
  PROBATION: "outline",
  RESIGNED: "destructive"
};

const ROLES_OPTIONS = [
  "SUPERADMIN",
  "ADMIN",
  "MANAGER",
  "HR",
  "ACCOUNTS",
  "EMPLOYEE"
];

const DESIGNATION_OPTIONS = [
  "INTERN",
  "TRAINEE",
  "JUNIOR_DEVELOPER",
  "ASSOCIATE_DEVELOPER",
  "DEVELOPER",
  "SENIOR_DEVELOPER",
  "TEAM_LEAD",
  "PRINCIPAL_ENGINEER",
  "JUNIOR_DESIGNER",
  "DESIGNER",
  "SENIOR_DESIGNER",
  "HR_EXECUTIVE",
  "SENIOR_HR",
  "SALES_REP",
  "SENIOR_SALES_REP",
  "ANALYST",
  "SENIOR_ANALYST",
  "ASSOCIATE_QA",
  "QA_ENGINEER",
  "SENIOR_QA",
  "DEVOPS_ENGINEER_DESIGNATION",
  "SENIOR_DEVOPS_ENGINEER",
  "PRODUCT_MANAGER",
  "SENIOR_PRODUCT_MANAGER",
  "MANAGER_DESIGNATION",
  "DIRECTOR",
  "ADMINISTRATOR",
  "ACCOUNTANT_DESIGNATION"
];

const STATUS_OPTIONS = [
  "ACTIVE",
  "ON_LEAVE",
  "TERMINATED",
  "PROBATION",
  "RESIGNED"
];

const managerRolesList = ['SUPERADMIN', 'ADMIN', 'MANAGER', 'HR', 'ACCOUNTS'];

export default function EmployeesPage() {
  const { toast } = useToast();
  const employees = useEmployeeStore((state) => state.employees) || [];
  const isLoading = useEmployeeStore((state) => state.loading);
  const error = useEmployeeStore((state) => state.error);
  const addEmployee = useEmployeeStore((state) => state.addEmployee);
  const updateEmployee = useEmployeeStore((state) => state.updateEmployee);
  const deleteEmployee = useEmployeeStore((state) => state.deleteEmployee);
  const initializeEmployees = useEmployeeStore((state) => state.initializeEmployees);
  const clearError = useEmployeeStore((state) => state.clearError);

  const { departments, fetchDepartments } = useDepartmentStore();

  // Filter out employees from manager options
  const managerOptions = React.useMemo(() => 
    employees
      .filter(emp => emp.role !== 'EMPLOYEE') // Only non-employees can be managers
      .map(emp => ({
        id: emp.id,
        value: emp.id,
        label: `${emp.name} (${emp.role})`,
        role: emp.role
      }))
  , [employees]);

  // Get department options from the store
  const departmentOptions = React.useMemo(() => 
    departments.map(dept => ({
      id: dept.id,
      value: dept.id,
      label: dept.name
    }))
  , [departments]);

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
    fetchDepartments();
  }, [initializeEmployees, fetchDepartments]);

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const handleAddEmployeeOpen = () => {
    setSelectedEmployee(null); 
    setIsAddDialogOpen(true);
  };

  const handleEditEmployeeOpen = (employee) => {
    // Transform the employee data to match form structure
    const formData = {
      ...employee,
      department: employee.departmentId, // Map departmentId to department for form
      reportingManagerId: employee.reportingManagerId || '',
      joinDate: employee.joinDate ? new Date(employee.joinDate) : new Date(),
      status: employee.status || 'ACTIVE',
      employeeType: employee.employeeType || 'FULL_TIME',
      gender: employee.gender || 'OTHER',
      role: employee.role || 'EMPLOYEE',
      designation: employee.designation || 'INTERN'
    };
    setSelectedEmployee(formData);
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

  const handleAddEmployee = async (data) => {
    try {
      const result = await addEmployee({
        ...data,
        role: data.role || 'EMPLOYEE',
        baseRole: data.role || 'EMPLOYEE',
        currentRole: data.role || 'EMPLOYEE',
        status: data.status || 'ACTIVE',
        designation: data.designation || 'INTERN',
        joinDate: data.joinDate || new Date().toISOString(),
        employeeType: data.employeeType || 'FULL_TIME',
        gender: data.gender || 'OTHER',
        departmentId: data.department?.id || data.department // Handle both object and direct ID
      });

      if (result.success) {
        toast({ title: "Success", description: "Employee added successfully!" });
        setIsAddDialogOpen(false);
      } else {
        toast({ 
          title: "Error", 
          description: result.error || "Failed to add employee",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add employee",
        variant: "destructive"
      });
    }
  };

  const handleEditEmployee = async (data) => {
    try {
      const result = await updateEmployee({
        ...data,
        id: selectedEmployee.id,
        departmentId: data.departmentId, // Use department directly as it's already transformed to departmentId
        avatarUrl: `https://i.pravatar.cc/150?u=${data.email || selectedEmployee.id}`,
        role: data.role || 'EMPLOYEE',
        designation: data.designation || 'INTERN',
        baseRole: data.role || 'EMPLOYEE',
        currentRole: data.role || 'EMPLOYEE',
        gender: data.gender || 'OTHER',
        employeeType: data.employeeType || 'FULL_TIME'
      });

      if (result.success) {
        toast({ title: "Success", description: `${data.name}'s details have been updated.` });
        handleDialogClose();
        // Refresh employee list after successful update
        await initializeEmployees();
      } else {
        toast({ 
          title: "Error", 
          description: result.error || "Failed to update employee.",
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveEmployee = async (employeeData) => {
    console.log("employeeData---------", employeeData);
    try {
      if (selectedEmployee && selectedEmployee.id) {
        // Editing existing employee
        await handleEditEmployee(employeeData);
      } else {
        // Adding new employee
        setIsGeneratingLetter(true);
        const newId = `EMP${String(Date.now()).slice(-4)}${String(employees.length + 1).padStart(3, '0')}`;
        const newEmployeeBase = {
          ...employeeData,
          avatarUrl: `https://i.pravatar.cc/150?u=${employeeData.email || newId}`,
          gender: employeeData.gender || "OTHER",
          departmentId: employeeData.departmentId, // Use department directly as it's already transformed to departmentId
          designation: employeeData.designation || 'INTERN'
        };

        setCurrentEmployeeForLetter(newEmployeeBase);

        try {
          // Get department name from departments list
          const departmentName = departments.find(d => d.id === employeeData.departmentId)?.name || 'Not Assigned';
          
          // Get reporting manager name from manager options
          const reportingManager = managerOptions.find(m => m.id === employeeData.reportingManagerId);
          const reportingManagerName = reportingManager ? `${reportingManager.label} (${reportingManager.role})` : 'To be assigned';

          const joiningLetterInput = {
            employeeName: newEmployeeBase.name,
            employeeEmail: newEmployeeBase.email,
            positionTitle: newEmployeeBase.role,
            department: departmentName,
            startDate: format(new Date(newEmployeeBase.joinDate), "MMMM d, yyyy"),
            salary: newEmployeeBase.salary || "As per discussion",
            employeeType: newEmployeeBase.employeeType,
            companyName: "PESU Venture Labs",
            companyAddress: "PESU Venture Labs, PES University, 100 Feet Ring Road, Banashankari Stage III, Bengaluru, Karnataka 560085",
            reportingManager: reportingManagerName,
          };

          const htmlContent = generatePlaceholderJoiningLetterHtml(joiningLetterInput);

          if (htmlContent) {
            setGeneratedJoiningLetterHtml(htmlContent);
            const newEmployeeWithLetter = { 
              ...newEmployeeBase, 
              joiningLetterHtml: htmlContent,
              departmentId: employeeData.departmentId // Ensure departmentId is set
            };
            const result = await addEmployee(newEmployeeWithLetter);
            if (result.success) {
              toast({ title: "Employee Added & Joining Letter Generated", description: `${newEmployeeBase.name} added. Preview letter.` });
              setIsJoiningLetterPreviewOpen(true);
              // Refresh employee list after successful add
              await initializeEmployees();
            } else {
              throw new Error(result.error || "Failed to add employee");
            }
          } else {
            throw new Error("Failed to generate joining letter content.");
          }
        } catch (error) {
          console.error("Error generating joining letter:", error);
          toast({ title: "Letter Generation Failed", description: error.message, variant: "destructive" });
          // Still try to add employee without letter
          const result = await addEmployee(newEmployeeBase);
          if (result.success) {
            toast({ title: "Employee Added (Letter Failed)", description: `${newEmployeeBase.name} added. Letter generation failed.` });
            // Refresh employee list after successful add
            await initializeEmployees();
          } else {
            toast({ 
              title: "Employee Addition Failed", 
              description: result.error || "Failed to add employee.", 
              variant: "destructive" 
            });
          }
        } finally {
          setIsGeneratingLetter(false);
          handleDialogClose();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedEmployee) {
      try {
        const result = await deleteEmployee(selectedEmployee.id);
        if (result.success) {
          toast({ title: "Employee Deleted", description: `${selectedEmployee.name} has been removed.`, variant: "destructive" });
        } else {
          toast({ 
            title: "Delete Failed", 
            description: result.error || "Failed to delete employee.", 
            variant: "destructive" 
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
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
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading employees...</span>
            </div>
          ) : (
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
                    <TableHead>Reporting Manager</TableHead>
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
                              ? employee.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                              : "NA"}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.role}</TableCell> 
                      <TableCell>{employee.designation}</TableCell>
                      <TableCell>
                        {employee?.department || 'Not Assigned'}
                      </TableCell>
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
                        {typeof employee.reportingManager === 'object' 
                          ? `${employee.reportingManager.name} `
                          : employee.reportingManager || 'N/A'}
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
          )}
          {!isLoading && employees.length === 0 && (
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
              departmentsOptions={departmentOptions}
              statusOptions={STATUS_OPTIONS}
              employeeTypeOptions={EMPLOYEE_TYPE_OPTIONS}
              reportingManagerOptions={managerOptions}
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