
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
import { PlusCircle, Edit, Trash2, FolderKanban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProjectForm } from "@/components/project/project-form"; // New component for project form

// Initial mock project data with Indian context
const initialProjects = [
  {
    id: "PROJ001",
    name: "HRMS Portal Development",
    description: "Build a comprehensive Human Resource Management System portal for PESU Venture Labs.",
    projectManager: "Rohan Mehra",
    startDate: "2024-01-10",
    endDate: "2024-12-31",
    status: "In Progress",
    teamMembers: "Priya Sharma, Aisha Khan, Suresh Kumar",
  },
  {
    id: "PROJ002",
    name: "Marketing Campaign Q3 2024",
    description: "Launch new marketing campaign for the Q3 product line.",
    projectManager: "Deepika Rao", // Product Owner can manage marketing projects
    startDate: "2024-07-01",
    endDate: "2024-09-30",
    status: "Planning",
    teamMembers: "Sunita Reddy, Arjun Patel",
  },
  {
    id: "PROJ003",
    name: "Bengaluru Office Expansion",
    description: "Oversee the expansion and setup of the new office floor.",
    projectManager: "Vikram Singh", // HR can manage office admin projects
    startDate: "2024-05-15",
    endDate: "2024-08-15",
    status: "Completed",
    teamMembers: "Rohan Mehra", // Project Manager involved in infra
  },
  {
    id: "PROJ004",
    name: "PESU VL Website Revamp",
    description: "Design and launch the new corporate website for PESU Venture Labs.",
    projectManager: "Priya Sharma", // Senior Developer can lead tech projects
    startDate: "2024-03-01",
    endDate: "2024-10-30",
    status: "On Hold",
    teamMembers: "Aisha Khan, Suresh Kumar",
  },
  {
    id: "PROJ005",
    name: "Campus Recruitment App",
    description: "Develop a mobile application for streamlining campus recruitment drives.",
    projectManager: "Vikram Singh", // HR Specialist managing recruitment tool
    startDate: "2024-02-15",
    endDate: "2024-11-20",
    status: "Cancelled",
    teamMembers: "Priya Sharma, Rohan Mehra",
  },
];

const PROJECT_STATUS_OPTIONS = ["Planning", "In Progress", "Completed", "On Hold", "Cancelled"];
const MOCK_EMPLOYEES_FOR_PM = [ // Updated with Indian names
    "Priya Sharma",
    "Rohan Mehra",
    "Aisha Khan",
    "Vikram Singh",
    "Suresh Kumar",
    "Sunita Reddy",
    "Arjun Patel",
    "Meera Iyer",
    "Imran Ahmed",
    "Deepika Rao",
    "Admin User"
];


const statusVariantMap = {
  Planning: "secondary",
  "In Progress": "default",
  Completed: "outline", 
  "On Hold": "secondary",
  Cancelled: "destructive",
};

export default function ProjectsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = React.useState(initialProjects);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState(null);

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
      setProjects((prevProjects) =>
        prevProjects.map((proj) =>
          proj.id === selectedProject.id ? { ...proj, ...projectData } : proj
        )
      );
      toast({ title: "Project Updated", description: `"${projectData.name}" details have been updated.` });
    } else {
      // Adding new project
      const newId = `PROJ${String(Date.now()).slice(-4)}${String(projects.length + 1).padStart(3, '0')}`;
      const newProject = {
        ...projectData,
        id: newId,
      };
      setProjects((prevProjects) => [newProject, ...prevProjects]);
      toast({ title: "Project Added", description: `"${projectData.name}" has been added.` });
    }
    handleDialogClose();
  };

  const handleConfirmDelete = () => {
    if (selectedProject) {
      setProjects((prevProjects) =>
        prevProjects.filter((proj) => proj.id !== selectedProject.id)
      );
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
                      {project.startDate ? new Date(project.startDate).toLocaleDateString("en-IN", { // Changed locale to en-IN
                        year: "numeric", month: "short", day: "numeric",
                      }) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {project.endDate ? new Date(project.endDate).toLocaleDateString("en-IN", { // Changed locale to en-IN
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

      {/* Add/Edit Project Dialog */}
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
              employeeOptions={MOCK_EMPLOYEES_FOR_PM}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
