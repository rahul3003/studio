"use client";

import * as React from "react";
import { useDepartmentStore } from '@/store/departmentStore';
import { useEmployeeStore } from '@/store/employeeStore';
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
import { DepartmentForm } from "@/components/department/department-form";

export default function DepartmentsPage() {
  const { toast } = useToast();
  const { 
    departments, 
    loading, 
    error,
    fetchDepartments,
    addDepartment,
    updateDepartment,
    deleteDepartment 
  } = useDepartmentStore();

  const { employees, initializeEmployees } = useEmployeeStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedDepartment, setSelectedDepartment] = React.useState(null);

  React.useEffect(() => {
    fetchDepartments();
    initializeEmployees();
  }, [fetchDepartments, initializeEmployees]);

  // Create a map of employee IDs to names for quick lookup
  const employeeMap = React.useMemo(() => {
    return employees.reduce((acc, emp) => {
      acc[emp.id] = emp.name;
      return acc;
    }, {});
  }, [employees]);

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

  const handleSaveDepartment = async (departmentData) => {
    try {
    if (selectedDepartment && selectedDepartment.id) {
      // Editing existing department
        const result = await updateDepartment({ ...departmentData, id: selectedDepartment.id });
        if (result.success) {
      toast({ title: "Department Updated", description: `${departmentData.name}'s details have been updated.` });
          await fetchDepartments(); // Refresh departments after update
        } else {
          toast({ 
            title: "Error", 
            description: result.error || "Failed to update department.",
            variant: "destructive"
          });
        }
    } else {
      // Adding new department
        const result = await addDepartment(departmentData);
        if (result.success) {
      toast({ title: "Department Added", description: `${departmentData.name} has been added.` });
          await fetchDepartments(); // Refresh departments after add
        } else {
          toast({ 
            title: "Error", 
            description: result.error || "Failed to add department.",
            variant: "destructive"
          });
        }
    }
    handleDialogClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedDepartment) {
      try {
        const result = await deleteDepartment(selectedDepartment.id);
        if (result.success) {
      toast({ title: "Department Deleted", description: `${selectedDepartment.name} has been removed.`, variant: "destructive" });
          await fetchDepartments(); // Refresh departments after delete
        } else {
          toast({ 
            title: "Error", 
            description: result.error || "Failed to delete department.",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete department",
          variant: "destructive"
        });
      }
    }
    handleDialogClose();
  };

  if (loading) {
    return <div>Loading departments...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

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
                    <TableCell>{employeeMap[department.headId] || 'Not Assigned'}</TableCell>
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
