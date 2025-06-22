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
import { PlusCircle, Edit, Trash2, Users as UsersIcon, Loader2, Download, Mail, FileText as FileTextIcon, Pencil, Plus, TableIcon, LayoutGrid, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmployeeForm, EMPLOYEE_TYPE_OPTIONS } from "@/components/employee/employee-form";
import { useEmployeeStore } from "@/store/employeeStore";
import { sendEmail } from '@/services/emailService'; 
import html2pdf from 'html2pdf.js';
import { format } from "date-fns";
import { useDepartmentStore } from '@/store/departmentStore';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { useEmail } from "@/context/email-context";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

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
  const { openEmailComposer } = useEmail();
  const employees = useEmployeeStore((state) => state.employees) || [];
  const isLoading = useEmployeeStore((state) => state.loading);
  const error = useEmployeeStore((state) => state.error);
  const addEmployee = useEmployeeStore((state) => state.addEmployee);
  const updateEmployee = useEmployeeStore((state) => state.updateEmployee);
  const deleteEmployee = useEmployeeStore((state) => state.deleteEmployee);
  const initializeEmployees = useEmployeeStore((state) => state.initializeEmployees);
  const clearError = useEmployeeStore((state) => state.clearError);

  const { departments, fetchDepartments } = useDepartmentStore();
  const router = useRouter();

  // Filter out employees from manager options
  const managerOptions = React.useMemo(() => 
    employees
      .filter(emp => emp.role !== 'EMPLOYEE') // Only non-employees can be managers
      .map(emp => ({
        id: emp?.id,
        value: emp?.id,
        label: `${emp?.name} (${emp?.role})`,
        role: emp?.role
      }))
  , [employees]);

  // Get department options from the store
  const departmentOptions = React.useMemo(() => 
    departments.map(dept => ({
      id: dept?.id,
      value: dept?.id,
      label: dept?.name
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
  const [viewMode, setViewMode] = React.useState('table'); // 'table' or 'card'
  
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
      department: employee?.departmentId, // Map departmentId to department for form
      reportingManagerId: employee?.reportingManagerId || '',
      joinDate: employee?.joinDate ? new Date(employee?.joinDate) : new Date(),
      status: employee?.status || 'ACTIVE',
      employeeType: employee?.employeeType || 'FULL_TIME',
      gender: employee?.gender || 'OTHER',
      role: employee?.role || 'EMPLOYEE',
      designation: employee?.designation || 'INTERN'
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
        role: data?.role || 'EMPLOYEE',
        baseRole: data?.role || 'EMPLOYEE',
        currentRole: data?.role || 'EMPLOYEE',
        status: data?.status || 'ACTIVE',
        designation: data?.designation || 'INTERN',
        joinDate: data?.joinDate || new Date().toISOString(),
        employeeType: data?.employeeType || 'FULL_TIME',
        gender: data?.gender || 'OTHER',
        departmentId: data?.department?.id || data?.department // Handle both object and direct ID
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
        id: selectedEmployee?.id,
        departmentId: data?.departmentId, // Use department directly as it's already transformed to departmentId
        avatarUrl: `https://i.pravatar.cc/150?u=${data?.email || selectedEmployee?.id}`,
        role: data?.role || 'EMPLOYEE',
        designation: data?.designation || 'INTERN',
        baseRole: data?.role || 'EMPLOYEE',
        currentRole: data?.role || 'EMPLOYEE',
        gender: data?.gender || 'OTHER',
        employeeType: data?.employeeType || 'FULL_TIME'
      });

      if (result.success) {
        toast({ title: "Success", description: `${data?.name}'s details have been updated.` });
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
          avatarUrl: `https://i.pravatar.cc/150?u=${employeeData?.email || newId}`,
          gender: employeeData?.gender || "OTHER",
          departmentId: employeeData?.departmentId, // Use department directly as it's already transformed to departmentId
          designation: employeeData?.designation || 'INTERN'
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
      // Get reporting manager details from managerOptions
      const reportingManager = managerOptions.find(m => m.id === currentEmployeeForLetter.reportingManagerId);
      const reportingManagerName = reportingManager ? reportingManager.label : 'To be assigned';

      // Get department name from departments list
      const department = departments.find(d => d.id === currentEmployeeForLetter.departmentId);
      const departmentName = department ? department.name : 'Not Assigned';

      const emailBody = `
        <p>Dear ${currentEmployeeForLetter.name},</p>
        <p>Welcome to PESU Venture Labs!</p>
        <p>We are pleased to confirm your joining with us. Please find your joining letter attached.</p>
        <p>Your details:</p>
        <ul>
          <li>Position: ${currentEmployeeForLetter.role}</li>
          <li>Department: ${departmentName}</li>
          <li>Reporting Manager: ${reportingManagerName}</li>
          <li>Join Date: ${format(new Date(currentEmployeeForLetter.joinDate), "MMMM d, yyyy")}</li>
        </ul>
        <p>If you have any questions, please don't hesitate to reach out to the HR team.</p>
        <p>Best regards,<br/>The PESU Venture Labs HR Team</p>
      `;

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

  // Helper function to safely get string value from any property
  const safeGetValue = (value, defaultValue = 'N/A') => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'object') {
      return value.name || defaultValue;
    }
    return String(value);
  };

  // Helper function to safely get department name
  const getDepartmentName = (department) => {
    if (!department) return 'Not Assigned';
    if (typeof department === 'object') {
      return department.name || 'Not Assigned';
    }
    return String(department);
  };

  // Helper function to safely get reporting manager name
  const getReportingManagerName = (manager) => {
    if (!manager) return 'N/A';
    if (typeof manager === 'object') {
      return manager.name || 'N/A';
    }
    return String(manager);
  };

  return (
    <div className="container mx-auto py-6">
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
          <div className="flex gap-2 items-center">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('table')}
              aria-label="Table View"
            >
              <TableIcon className="h-5 w-5" />
            </Button>
            <Button
              variant={viewMode === 'card' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('card')}
              aria-label="Card View"
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button onClick={handleAddEmployeeOpen} className="w-full md:w-auto">
              <Plus className="mr-2 h-5 w-5" />
              Add New Employee
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading employees...</span>
            </div>
          ) : viewMode === 'table' ? (
            <div className="w-full overflow-x-auto lg:overflow-x-visible">
              <table className="w-full table-fixed border-separate border-spacing-y-2">
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-white w-16">Avatar</th>
                    <th className="sticky left-16 bg-white w-56">Name</th>
                    <th className="min-w-28">Job Title</th>
                    <th className="min-w-32">Designation</th>
                    <th className="min-w-32 max-w-[120px] truncate">Department</th>
                    <th className="min-w-24">Type</th>
                    <th className="min-w-20">Gender</th>
                    <th className="min-w-32">Join Date</th>
                    <th className="min-w-40 max-w-[160px] truncate">Reporting Manager</th>
                    <th className="sticky right-40 bg-white w-24">Status</th>
                    <th className="sticky right-0 bg-white w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    employee && (
                      <tr key={employee.id} className="bg-white hover:bg-gray-50 transition-all text-sm">
                        <td className="sticky left-0 bg-white py-2 px-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={employee?.avatarUrl} alt={employee?.name || 'Employee'} />
                            <AvatarFallback>
                              {employee?.name
                                ? employee.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                : "NA"}
                            </AvatarFallback>
                          </Avatar>
                        </td>
                        <td className="sticky left-16 bg-white py-2 px-2 font-medium text-blue-900 whitespace-nowrap align-top">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <Button variant="link" className="p-0 h-auto font-medium text-left block" onClick={() => router.push(`/dashboard/employees/${employee.id}`)}>
                                <div>{employee?.name || 'N/A'}</div>
                                <div className="text-xs text-muted-foreground font-normal truncate max-w-[180px]" title={employee?.email || 'N/A'}>
                                  {employee?.email || 'N/A'}
                                </div>
                              </Button>
                            </HoverCardTrigger>
                            <HoverCardContent side="right" sideOffset={12} className="w-96 max-w-[98vw] p-5 rounded-lg shadow-2xl border bg-white z-[9999]">
                              <div className="flex gap-4 items-start">
                                <Avatar className="h-16 w-16">
                                  <AvatarImage src={employee?.avatarUrl} />
                                  <AvatarFallback>
                                    {employee?.name
                                      ? employee.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .toUpperCase()
                                      : "NA"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                  <div className="text-lg font-semibold text-blue-900">{employee?.name}</div>
                                  <div className="text-sm text-muted-foreground break-all">{employee?.email}</div>
                                  <div className="flex items-center pt-2">
                                    <Badge variant={statusVariantMap[employee?.status] || "outline"}>
                                      {employee?.status || 'N/A'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <Separator className="my-4" />
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <div className="text-muted-foreground">Role:</div>
                                <div className="font-medium">{safeGetValue(employee?.role)}</div>
                                <div className="text-muted-foreground">Designation:</div>
                                <div className="font-medium">{safeGetValue(employee?.designation)}</div>
                                <div className="text-muted-foreground">Department:</div>
                                <div className="font-medium">{getDepartmentName(employee?.department)}</div>
                                <div className="text-muted-foreground">Join Date:</div>
                                <div className="font-medium">{employee?.joinDate ? new Date(employee.joinDate).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : 'N/A'}</div>
                                <div className="text-muted-foreground">Reporting To:</div>
                                <div className="font-medium">{getReportingManagerName(employee?.reportingManager)}</div>
                              </div>
                              <Separator className="my-4" />
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleEditEmployeeOpen(employee)}>
                                    <Edit className="h-4 w-4 mr-2" />Edit
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => { openEmailComposer({ to: employee.email, subject: `Message for ${employee.name}`, body: `Dear ${employee.name},\n\n` }); }}>
                                    <Mail className="h-4 w-4 mr-2" />Email
                                  </Button>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:text-destructive" onClick={() => handleDeleteEmployeeOpen(employee)}>
                                  <Trash2 className="h-4 w-4 mr-2" />Delete
                                </Button>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </td>
                        <td className="py-2 px-2 whitespace-nowrap min-w-28">{safeGetValue(employee?.role)}</td>
                        <td className="py-2 px-2 whitespace-nowrap min-w-32">{safeGetValue(employee?.designation)}</td>
                        <td className="py-2 px-2 whitespace-nowrap min-w-32 max-w-[120px] truncate">
                          <div className="truncate" title={getDepartmentName(employee?.department)}>
                            {getDepartmentName(employee?.department)}
                          </div>
                        </td>
                        <td className="py-2 px-2 whitespace-nowrap min-w-24">{safeGetValue(employee?.employeeType)}</td>
                        <td className="py-2 px-2 whitespace-nowrap min-w-20">{safeGetValue(employee?.gender)}</td>
                        <td className="py-2 px-2 whitespace-nowrap min-w-32">
                          {employee?.joinDate ? new Date(employee.joinDate).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }) : 'N/A'}
                        </td>
                        <td className="py-2 px-2 whitespace-nowrap min-w-40 max-w-[160px] truncate">
                          <div className="truncate" title={getReportingManagerName(employee?.reportingManager)}>
                            {getReportingManagerName(employee?.reportingManager)}
                          </div>
                        </td>
                        <td className="sticky right-40 bg-white py-2 px-2">
                          <Badge variant={statusVariantMap[employee?.status] || "outline"}>
                            {safeGetValue(employee?.status)}
                          </Badge>
                        </td>
                        <td className="sticky right-0 bg-white py-2 px-2 flex gap-2 items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="mr-1 hover:bg-accent/20"
                            onClick={() => handleEditEmployeeOpen(employee)}
                          >
                            <Edit className="h-4 w-4 text-primary" />
                            <span className="sr-only">Edit {employee?.name || 'Employee'}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-destructive/20"
                            onClick={() => handleDeleteEmployeeOpen(employee)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete {employee?.name || 'Employee'}</span>
                          </Button>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {employees.map((employee) => (
                <div key={employee.id} className="relative group">
                  <Card className="shadow border p-4 flex flex-row items-center gap-4 text-left h-28 overflow-visible relative cursor-pointer"
                    onClick={e => {
                      // Prevent navigation if clicking the 3-dots menu
                      if (e.target.closest('.employee-card-menu')) return;
                      router.push(`/dashboard/employees/${employee.id}`);
                    }}
                  >
                    {/* 3-dots menu at top-right */}
                    <div className="absolute top-2 right-2 z-10 employee-card-menu">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="p-1">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 z-20">
                          <DropdownMenuItem onClick={() => handleEditEmployeeOpen(employee)}>
                            <Edit className="h-4 w-4 mr-2 text-primary" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { openEmailComposer({ to: employee.email, subject: `Message for ${employee.name}`, body: `Dear ${employee.name},\n\n` }); }}>
                            <Mail className="h-4 w-4 mr-2 text-primary" /> Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteEmployeeOpen(employee)}>
                            <Trash2 className="h-4 w-4 mr-2 text-destructive" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {/* Avatar and info */}
                    <Avatar className="h-16 w-16 min-w-[4rem]">
                      <AvatarImage src={employee?.avatarUrl} alt={employee?.name || 'Employee'} />
                      <AvatarFallback>
                        {employee?.name
                          ? employee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                          : "NA"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <div className="font-semibold text-blue-900 text-lg truncate">{employee?.name || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[180px]">{employee?.email || 'N/A'}</div>
                      <Badge variant={statusVariantMap[employee?.status] || "outline"} className="mt-1 w-fit">{safeGetValue(employee?.status)}</Badge>
                    </div>
                  </Card>
                  {/* Hover overlay for details, only on desktop */}
                  <div className="hidden lg:block">
                    <div className="absolute left-0 top-0 w-full min-w-[320px] max-w-[360px] z-[9999] pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 opacity-0 transition-all duration-200"
                      style={{transform: 'translateY(-110%)'}}>
                      <div className="bg-white rounded-xl shadow-2xl border p-5">
                        <div className="text-base font-semibold text-blue-900 mb-2">{employee?.name}</div>
                        <div className="text-xs text-muted-foreground mb-2 break-all">{employee?.email}</div>
                        <Badge variant={statusVariantMap[employee?.status] || "outline"} className="mb-2">{safeGetValue(employee?.status)}</Badge>
                        <div className="text-sm space-y-1 mt-2">
                          <div><span className="text-muted-foreground">Role:</span> <span className="font-medium">{safeGetValue(employee?.role)}</span></div>
                          <div><span className="text-muted-foreground">Designation:</span> <span className="font-medium">{safeGetValue(employee?.designation)}</span></div>
                          <div><span className="text-muted-foreground">Department:</span> <span className="font-medium">{getDepartmentName(employee?.department)}</span></div>
                          <div><span className="text-muted-foreground">Join Date:</span> <span className="font-medium">{employee?.joinDate ? new Date(employee.joinDate).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : 'N/A'}</span></div>
                          <div><span className="text-muted-foreground">Reporting To:</span> <span className="font-medium">{getReportingManagerName(employee?.reportingManager)}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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