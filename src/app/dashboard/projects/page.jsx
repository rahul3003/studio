"use client";

import * as React from "react";
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
import { PlusCircle, Edit, Trash2, FolderKanban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProjectForm } from "@/components/project/project-form";
import { useProjectStore } from "@/store/projectStore"; // Import the store
import { useEmployeeStore } from "@/store/employeeStore"; // To get employee names for PM dropdown

const PROJECT_STATUS_OPTIONS = ["Planning", "In Progress", "Completed", "On Hold", "Cancelled"];

const statusVariantMap = {
  Planning: "secondary",
  "In Progress": "default",
  Completed: "outline", 
  "On Hold": "secondary",
  Cancelled: "destructive",
};

export default function ProjectsPage() {
  const { toast } = useToast();
  // Use Zustand stores
  const projects = useProjectStore((state) => state.projects);
  const addProject = useProjectStore((state) => state.addProject);
  const updateProject = useProjectStore((state) => state.updateProject);
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const initializeProjects = useProjectStore((state) => state._initializeProjects);

  const employees = useEmployeeStore((state) => state.employees);
  const MOCK_EMPLOYEES_FOR_PM = employees.map(emp => emp.name);


  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState(null);

  React.useEffect(() => {
    initializeProjects(); // Ensure store is initialized
  }, [initializeProjects]);

  const handleAddProjectOpen = () => {
    setSelectedProject(null);
    setIsAddDialogOpen(true);
  };

  const handleEditProjectOpen = (project) => {
    setSelectedProject(project);
    setIsEditDialogOpen(true);
  };

  const handleDeleteProjectOpen = (project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedProject(null);
  };

  const handleSaveProject = (projectData) => {
    if (selectedProject && selectedProject.id) {
      // Editing existing project
      updateProject({ ...projectData, id: selectedProject.id });
      toast({ title: "Project Updated", description: `"${projectData.name}" details have been updated.` });
    } else {
      // Adding new project
      const newId = `PROJ${String(Date.now()).slice(-4)}${String(projects.length + 1).padStart(3, '0')}`;
      const newProject = {
        ...projectData,
        id: newId,
      };
      addProject(newProject);
      toast({ title: "Project Added", description: `"${projectData.name}" has been added.` });
    }
    handleDialogClose();
  };

  const handleConfirmDelete = () => {
    if (selectedProject) {
      deleteProject(selectedProject.id);
      toast({ title: "Project Deleted", description: `"${selectedProject.name}" has been removed.`, variant: "destructive" });
    }
    handleDialogClose();
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col gap-y-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FolderKanban className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl">Manage Projects</CardTitle>
            </div>
            <CardDescription>
              View, add, edit, and manage company projects.
            </CardDescription>
          </div>
          <Button onClick={handleAddProjectOpen} className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Project
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Project Manager</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.id}</TableCell>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>{project.projectManager}</TableCell>
                    <TableCell>
                      {project.startDate ? new Date(project.startDate).toLocaleDateString("en-IN", {
                        year: "numeric", month: "short", day: "numeric",
                      }) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {project.endDate ? new Date(project.endDate).toLocaleDateString("en-IN", {
                        year: "numeric", month: "short", day: "numeric",
                      }) : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariantMap[project.status] || "outline"}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-1 hover:bg-accent/20"
                        onClick={() => handleEditProjectOpen(project)}
                      >
                        <Edit className="h-4 w-4 text-primary" />
                        <span className="sr-only">Edit {project.name}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-destructive/20"
                        onClick={() => handleDeleteProjectOpen(project)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete {project.name}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {projects.length === 0 && (
            <div className="py-10 text-center text-muted-foreground">
              No projects found. Click "Add New Project" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-lg md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProject ? "Edit Project" : "Add New Project"}</DialogTitle>
            <DialogDescription>
              {selectedProject ? "Update the details of the project." : "Fill in the details to add a new project."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ProjectForm
              onSubmit={handleSaveProject}
              initialData={selectedProject}
              onCancel={handleDialogClose}
              statusOptions={PROJECT_STATUS_OPTIONS}
              employeeOptions={MOCK_EMPLOYEES_FOR_PM.length > 0 ? MOCK_EMPLOYEES_FOR_PM : ["Default PM"]}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={handleDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project:{" "}
              <strong>{selectedProject?.name}</strong>.
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
