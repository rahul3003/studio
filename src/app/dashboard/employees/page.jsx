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
import { PlusCircle, Edit, Trash2, Users as UsersIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmployeeForm } from "@/components/employee/employee-form";
import { useEmployeeStore } from "@/store/employeeStore"; // Import the store

// Initial mock employee data (used to seed the store if it's empty)
export const initialEmployees = [
  {
    id: "EMP001",
    name: "Priya Sharma",
    email: "priya.sharma@pesuventurelabs.com",
    avatarUrl: "https://i.pravatar.cc/150?u=priya.sharma",
    role: "Software Engineer",
    designation: "Senior Developer",
    department: "Technology",
    status: "Active",
    joinDate: "2022-08-15",
    gender: "Female",
  },
  {
    id: "EMP002",
    name: "Rohan Mehra",
    email: "rohan.mehra@pesuventurelabs.com",
    avatarUrl: "https://i.pravatar.cc/150?u=rohan.mehra",
    role: "Project Manager",
    designation: "Team Lead",
    department: "Operations",
    status: "Active",
    joinDate: "2021-05-20",
    gender: "Male",
  },
  {
    id: "EMP003",
    name: "Aisha Khan",
    email: "aisha.khan@pesuventurelabs.com",
    avatarUrl: "https://i.pravatar.cc/150?u=aisha.khan",
    role: "UX Designer",
    designation: "Junior Designer",
    department: "Design",
    status: "On Leave",
    joinDate: "2023-01-10",
    gender: "Female",
  },
  {
    id: "EMP004",
    name: "Vikram Singh",
    email: "vikram.singh@pesuventurelabs.com",
    avatarUrl: "https://i.pravatar.cc/150?u=vikram.singh",
    role: "HR Specialist",
    designation: "HR Executive",
    department: "Human Resources",
    status: "Active",
    joinDate: "2020-03-01",
    gender: "Male",
  },
  {
    id: "EMP005",
    name: "Suresh Kumar",
    email: "suresh.kumar@pesuventurelabs.com",
    avatarUrl: "https://i.pravatar.cc/150?u=suresh.kumar",
    role: "Frontend Developer",
    designation: "Associate Developer",
    department: "Technology",
    status: "Terminated",
    joinDate: "2022-11-01",
    gender: "Male",
  },
  {
    id: "EMP006",
    name: "Sunita Reddy",
    email: "sunita.reddy@pesuventurelabs.com",
    avatarUrl: "https://i.pravatar.cc/150?u=sunita.reddy",
    role: "Sales Executive",
    designation: "Senior Sales Rep",
    department: "Sales",
    status: "Active",
    joinDate: "2023-06-22",
    gender: "Female",
  },
  {
    id: "EMP007",
    name: "Arjun Patel",
    email: "arjun.patel@pesuventurelabs.com",
    avatarUrl: "https://i.pravatar.cc/150?u=arjun.patel",
    role: "Data Analyst",
    designation: "Analyst",
    department: "Marketing",
    status: "Active",
    joinDate: "2023-02-15",
    gender: "Male",
  },
  {
    id: "EMP008",
    name: "Meera Iyer",
    email: "meera.iyer@pesuventurelabs.com",
    avatarUrl: "https://i.pravatar.cc/150?u=meera.iyer",
    role: "QA Engineer",
    designation: "Associate QA",
    department: "Technology",
    status: "Active",
    joinDate: "2024-01-05",
    gender: "Female",
  },
  {
    id: "EMP009",
    name: "Imran Ahmed",
    email: "imran.ahmed@pesuventurelabs.com",
    avatarUrl: "https://i.pravatar.cc/150?u=imran.ahmed",
    role: "DevOps Engineer",
    designation: "Senior DevOps",
    department: "Technology",
    status: "On Leave",
    joinDate: "2022-03-10",
    gender: "Male",
  },
  {
    id: "EMP010",
    name: "Deepika Rao",
    email: "deepika.rao@pesuventurelabs.com",
    avatarUrl: "https://i.pravatar.cc/150?u=deepika.rao",
    role: "Product Owner",
    designation: "Product Manager",
    department: "Product",
    status: "Active",
    joinDate: "2021-09-01",
    gender: "Female",
  },
   {
    id: "EMP011",
    name: "Admin User", 
    email: "admin@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=admin.user",
    role: "System Administrator",
    designation: "Administrator",
    department: "IT",
    status: "Active",
    joinDate: "2020-01-01",
    gender: "Other",
  }
];

const statusVariantMap = {
  Active: "default",
  "On Leave": "secondary",
  Terminated: "destructive",
};

const ROLES_OPTIONS = ["Software Engineer", "Project Manager", "UX Designer", "HR Specialist", "Frontend Developer", "Sales Executive", "Marketing Manager", "Data Analyst", "QA Engineer", "DevOps Engineer", "Product Owner", "Business Analyst", "System Administrator", "Operations Head", "Accountant"];
const DESIGNATION_OPTIONS = ["Intern", "Trainee", "Junior Developer", "Associate Developer", "Developer", "Senior Developer", "Team Lead", "Principal Engineer", "Junior Designer", "Designer", "Senior Designer", "HR Executive", "Senior HR", "Sales Rep", "Senior Sales Rep", "Analyst", "Senior Analyst", "Associate QA", "QA Engineer", "Senior QA", "DevOps Engineer", "Senior DevOps", "Product Manager", "Senior Product Manager", "Manager", "Director", "Administrator", "Accountant"];
const DEPARTMENTS_OPTIONS = ["Technology", "Operations", "Design", "Human Resources", "Sales", "Marketing", "Finance", "Product", "Quality Assurance", "IT", "Administration"];
const STATUS_OPTIONS = ["Active", "On Leave", "Terminated", "Probation", "Resigned"];

export default function EmployeesPage() {
  const { toast } = useToast();
  // Use Zustand store
  const employees = useEmployeeStore((state) => state.employees);
  const addEmployee = useEmployeeStore((state) => state.addEmployee);
  const updateEmployee = useEmployeeStore((state) => state.updateEmployee);
  const deleteEmployee = useEmployeeStore((state) => state.deleteEmployee);
  const initializeEmployees = useEmployeeStore((state) => state._initializeEmployees);

  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState(null);
  
  React.useEffect(() => {
    initializeEmployees(); // Ensure store is initialized with mock data if empty
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

  const handleSaveEmployee = (employeeData) => {
    if (selectedEmployee && selectedEmployee.id) {
      // Editing existing employee
      updateEmployee({ ...employeeData, avatarUrl: `https://i.pravatar.cc/150?u=${employeeData.email || selectedEmployee.id}` });
      toast({ title: "Employee Updated", description: `${employeeData.name}'s details have been updated.` });
    } else {
      // Adding new employee
      const newId = `EMP${String(Date.now()).slice(-4)}${String(employees.length + 1).padStart(3, '0')}`;
      const newEmployee = {
        ...employeeData,
        id: newId,
        avatarUrl: `https://i.pravatar.cc/150?u=${employeeData.email || newId}`,
        gender: employeeData.gender || "Other", 
      };
      addEmployee(newEmployee);
      toast({ title: "Employee Added", description: `${employeeData.name} has been added to the system.` });
    }
    handleDialogClose();
  };

  const handleConfirmDelete = () => {
    if (selectedEmployee) {
      deleteEmployee(selectedEmployee.id);
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
