
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
import { PlusCircle, Edit, Trash2, Users as UsersIcon } from "lucide-react"; // Renamed Users to UsersIcon
import { useToast } from "@/hooks/use-toast";
import { EmployeeForm } from "@/components/employee/employee-form";

// Initial mock employee data
const initialEmployees = [
  {
    id: "EMP001",
    name: "Alice Wonderland",
    email: "alice.wonderland@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=alice",
    role: "Software Engineer", // This is the Job Title/Primary Function
    designation: "Senior",   // This is the new Designation field
    department: "Technology",
    status: "Active",
    joinDate: "2022-08-15",
  },
  {
    id: "EMP002",
    name: "Bob The Builder",
    email: "bob.builder@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=bob",
    role: "Project Manager",
    designation: "Lead",
    department: "Operations",
    status: "Active",
    joinDate: "2021-05-20",
  },
  {
    id: "EMP003",
    name: "Charlie Chaplin",
    email: "charlie.chaplin@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=charlie",
    role: "UX Designer",
    designation: "Junior",
    department: "Design",
    status: "On Leave",
    joinDate: "2023-01-10",
  },
  {
    id: "EMP004",
    name: "Diana Prince",
    email: "diana.prince@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=diana",
    role: "HR Specialist",
    designation: "Staff",
    department: "Human Resources",
    status: "Active",
    joinDate: "2020-03-01",
  },
  {
    id: "EMP005",
    name: "Edward Scissorhands",
    email: "edward.hands@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=edward",
    role: "Frontend Developer",
    designation: "Associate",
    department: "Technology",
    status: "Terminated",
    joinDate: "2022-11-01",
  },
  {
    id: "EMP006",
    name: "Fiona Gallagher",
    email: "fiona.gallagher@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=fiona",
    role: "Sales Executive",
    designation: "Senior",
    department: "Sales",
    status: "Active",
    joinDate: "2023-06-22",
  },
];

const statusVariantMap = {
  Active: "default",
  "On Leave": "secondary",
  Terminated: "destructive",
};

const ROLES_OPTIONS = ["Software Engineer", "Project Manager", "UX Designer", "HR Specialist", "Frontend Developer", "Sales Executive", "Marketing Manager", "Data Analyst", "QA Engineer", "DevOps Engineer", "Product Owner", "Business Analyst"];
const DESIGNATION_OPTIONS = ["Intern", "Trainee", "Junior", "Associate", "Staff", "Senior", "Lead", "Principal", "Manager", "Director"];
const DEPARTMENTS_OPTIONS = ["Technology", "Operations", "Design", "Human Resources", "Sales", "Marketing", "Finance", "Product", "Quality Assurance"];
const STATUS_OPTIONS = ["Active", "On Leave", "Terminated", "Probation", "Resigned"];

export default function EmployeesPage() {
  const { toast } = useToast();
  const [employees, setEmployees] = React.useState(initialEmployees);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState(null);

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

  const handleSaveEmployee = (employeeData) => {
    if (selectedEmployee && selectedEmployee.id) {
      // Editing existing employee
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.id === selectedEmployee.id ? { ...emp, ...employeeData, avatarUrl: `https://i.pravatar.cc/150?u=${employeeData.email || selectedEmployee.id}` } : emp
        )
      );
      toast({ title: "Employee Updated", description: `${employeeData.name}'s details have been updated.` });
    } else {
      // Adding new employee
      const newId = `EMP${String(Date.now()).slice(-4)}${String(employees.length + 1).padStart(3, '0')}`;
      const newEmployee = {
        ...employeeData,
        id: newId,
        avatarUrl: `https://i.pravatar.cc/150?u=${employeeData.email || newId}`,
      };
      setEmployees((prevEmployees) => [newEmployee, ...prevEmployees]);
      toast({ title: "Employee Added", description: `${employeeData.name} has been added to the system.` });
    }
    handleDialogClose();
  };

  const handleConfirmDelete = () => {
    if (selectedEmployee) {
      setEmployees((prevEmployees) =>
        prevEmployees.filter((emp) => emp.id !== selectedEmployee.id)
      );
      toast({ title: "Employee Deleted", description: `${selectedEmployee.name} has been removed.`, variant: "destructive" });
    }
    handleDialogClose();
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
                    <TableCell>
                      {new Date(employee.joinDate).toLocaleDateString("en-US", {
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
    </div>
  );
}
