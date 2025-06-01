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
  DialogTrigger,
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
import { PlusCircle, Edit, Trash2, FolderKanban, Loader2, Plus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProjectForm } from "@/components/project/project-form";
import { useProjectStore } from "@/store/projectStore";
import { useEmployeeStore } from "@/store/employeeStore";
import { useDepartmentStore } from "@/store/departmentStore";

const PROJECT_STATUS_OPTIONS = ["PLANNING", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "CANCELLED"];

const statusVariantMap = {
  PLANNING: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "outline",
  ON_HOLD: "secondary",
  CANCELLED: "destructive",
};

export default function ProjectsPage() {
  const { toast } = useToast();
  const { 
    projects, 
    loading, 
    error,
    fetchProjects, 
    createProject, 
    updateProject, 
    deleteProject,
    addTeamMember,
    removeTeamMember,
    getTeamMembers,
    clearError,
  } = useProjectStore();

  const employees = useEmployeeStore((state) => state.employees) || [];
  const departments = useDepartmentStore((state) => state.departments) || [];

  // Ensure we have valid arrays before passing to ProjectForm
  const employeeList = Array.isArray(employees) ? employees : [];
  const departmentList = Array.isArray(departments) ? departments : [];

  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState(null);

  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

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

  const handleSaveProject = async (projectData) => {
    try {
    if (selectedProject && selectedProject.id) {
        await updateProject(selectedProject.id, projectData);
        toast({ 
          title: "Project Updated", 
          description: `"${projectData.name}" details have been updated.` 
        });
    } else {
        await createProject(projectData);
        toast({ 
          title: "Project Added", 
          description: `"${projectData.name}" has been added.` 
        });
    }
    handleDialogClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save project",
        variant: "destructive"
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedProject) {
      try {
        await deleteProject(selectedProject.id);
        toast({ 
          title: "Project Deleted", 
          description: `"${selectedProject.name}" has been removed.`, 
          variant: "destructive" 
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to delete project",
          variant: "destructive"
        });
      }
    }
    handleDialogClose();
  };

  const handleAddTeamMember = async (projectId, employeeId) => {
    try {
      await addTeamMember(projectId, employeeId);
      toast({
        title: 'Success',
        description: 'Team member added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRemoveTeamMember = async (projectId, employeeId) => {
    try {
      await removeTeamMember(projectId, employeeId);
      toast({
        title: 'Success',
        description: 'Team member removed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANNING':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'ON_HOLD':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const projectsList = Array.isArray(projects) ? projects : [];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error: {error}
        <Button onClick={clearError}>Try Again</Button>
      </div>
    );
  }

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
          <Button 
            onClick={handleAddProjectOpen}
            className="w-full md:w-auto"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <>
                <Plus className="mr-2 h-5 w-5" />
            Add New Project
              </>
            )}
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
                {projectsList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">No projects found. Click "Add New Project" to get started.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  projectsList.map((project) => {
                    const projectId = project.id || `project-${Math.random().toString(36).substr(2, 9)}`;
                    
                    return (
                      <TableRow key={projectId}>
                        <TableCell className="font-medium">{projectId}</TableCell>
                        <TableCell>{project.name || 'N/A'}</TableCell>
                        <TableCell>
                          {project.projectManager
                            ? `${project.projectManager.name} (${project.projectManager.email}, ${project.projectManager.role})`
                            : 'N/A'}
                        </TableCell>
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
                          <Badge className={getStatusColor(project.status)}>
                            {project.status || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                          <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-1 hover:bg-accent/20"
                        onClick={() => handleEditProjectOpen(project)}
                              disabled={loading}
                      >
                        <Edit className="h-4 w-4 text-primary" />
                              <span className="sr-only">Edit {project.name || 'project'}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-destructive/20"
                        onClick={() => handleDeleteProjectOpen(project)}
                              disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete {project.name || 'project'}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-accent/20"
                              onClick={() => {
                                setSelectedProject(project);
                                getTeamMembers(project.id);
                              }}
                              disabled={loading}
                            >
                              <Users className="h-4 w-4 text-primary" />
                              <span className="sr-only">Manage Team</span>
                      </Button>
                          </div>
                    </TableCell>
                  </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new project.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ProjectForm
              onSubmit={handleSaveProject}
              initialData={null}
              onCancel={() => setIsAddDialogOpen(false)}
              statusOptions={PROJECT_STATUS_OPTIONS}
              employees={employeeList}
              departments={departmentList}
              loading={loading}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the details of the project.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ProjectForm
              onSubmit={handleSaveProject}
              initialData={selectedProject}
              onCancel={() => setIsEditDialogOpen(false)}
              statusOptions={PROJECT_STATUS_OPTIONS}
              employees={employeeList}
              departments={departmentList}
              loading={loading}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project:{" "}
              <strong>{selectedProject?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDialogClose} disabled={loading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="bg-destructive hover:bg-destructive/90"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
