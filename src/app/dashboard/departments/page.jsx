
"use client";

import * as React from "react";
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
import { PlusCircle, Edit, Trash2, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DepartmentForm } from "@/components/department/department-form"; // New component

// Initial mock department data
const initialDepartments = [
  {
    id: "DEPT001",
    name: "Technology",
    head: "Dr. Emily Carter",
    description: "Responsible for software development and IT infrastructure.",
    creationDate: "2022-01-15",
  },
  {
    id: "DEPT002",
    name: "Human Resources",
    head: "Michael Chen",
    description: "Manages employee relations, recruitment, and benefits.",
    creationDate: "2021-03-20",
  },
  {
    id: "DEPT003",
    name: "Marketing",
    head: "Sophia Rodriguez",
    description: "Oversees product promotion, advertising, and market research.",
    creationDate: "2022-06-10",
  },
  {
    id: "DEPT004",
    name: "Sales",
    head: "David Miller",
    description: "Focuses on customer acquisition and revenue generation.",
    creationDate: "2020-11-01",
  },
  {
    id: "DEPT005",
    name: "Operations",
    head: "Jessica Lee",
    description: "Manages daily business operations and process optimization.",
    creationDate: "2023-02-28",
  },
];

export default function DepartmentsPage() {
  const { toast } = useToast();
  const [departments, setDepartments] = React.useState(initialDepartments);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedDepartment, setSelectedDepartment] = React.useState(null);

  const handleAddDepartmentOpen = () => {
    setSelectedDepartment(null);
    setIsAddDialogOpen(true);
  };

  const handleEditDepartmentOpen = (department) => {
    setSelectedDepartment(department);
    setIsEditDialogOpen(true);
  };

  const handleDeleteDepartmentOpen = (department) => {
    setSelectedDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedDepartment(null);
  };

  const handleSaveDepartment = (departmentData) => {
    if (selectedDepartment && selectedDepartment.id) {
      // Editing existing department
      setDepartments((prevDepartments) =>
        prevDepartments.map((dept) =>
          dept.id === selectedDepartment.id ? { ...dept, ...departmentData } : dept
        )
      );
      toast({ title: "Department Updated", description: `${departmentData.name}'s details have been updated.` });
    } else {
      // Adding new department
      const newId = `DEPT${String(Date.now()).slice(-4)}${String(departments.length + 1).padStart(3, '0')}`;
      const newDepartment = {
        ...departmentData,
        id: newId,
        creationDate: new Date().toISOString().split('T')[0], // Set creation date to today
      };
      setDepartments((prevDepartments) => [newDepartment, ...prevDepartments]);
      toast({ title: "Department Added", description: `${departmentData.name} has been added.` });
    }
    handleDialogClose();
  };

  const handleConfirmDelete = () => {
    if (selectedDepartment) {
      setDepartments((prevDepartments) =>
        prevDepartments.filter((dept) => dept.id !== selectedDepartment.id)
      );
      toast({ title: "Department Deleted", description: `${selectedDepartment.name} has been removed.`, variant: "destructive" });
    }
    handleDialogClose();
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col gap-y-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl">Manage Departments</CardTitle>
            </div>
            <CardDescription>
              View, add, edit, and manage department information.
            </CardDescription>
          </div>
          <Button onClick={handleAddDepartmentOpen} className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Department
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Head of Department</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Creation Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">{department.id}</TableCell>
                    <TableCell>{department.name}</TableCell>
                    <TableCell>{department.head}</TableCell>
                    <TableCell className="max-w-xs truncate">{department.description}</TableCell>
                    <TableCell>
                      {new Date(department.creationDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-1 hover:bg-accent/20"
                        onClick={() => handleEditDepartmentOpen(department)}
                      >
                        <Edit className="h-4 w-4 text-primary" />
                        <span className="sr-only">Edit {department.name}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-destructive/20"
                        onClick={() => handleDeleteDepartmentOpen(department)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete {department.name}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {departments.length === 0 && (
            <div className="py-10 text-center text-muted-foreground">
              No departments found. Click "Add New Department" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Department Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-lg md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedDepartment ? "Edit Department" : "Add New Department"}</DialogTitle>
            <DialogDescription>
              {selectedDepartment ? "Update the details of the department." : "Fill in the details to add a new department."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <DepartmentForm
              onSubmit={handleSaveDepartment}
              initialData={selectedDepartment}
              onCancel={handleDialogClose}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={handleDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this department?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <strong>{selectedDepartment?.name}</strong>.
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
