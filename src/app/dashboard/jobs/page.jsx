"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { PlusCircle, Edit, Trash2, BriefcaseBusiness, Eye, ExternalLink, MapPin, CalendarDays, Briefcase, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { JobForm } from "@/components/job/job-form";
import { JobCard } from "@/components/job/job-card"; 
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useJobStore } from "@/store/jobStore"; // Import job store
import { useDepartmentStore } from "@/store/departmentStore"; // For department options

const JOB_STATUS_OPTIONS = ["Open", "Closed", "Filled", "Draft"];
const JOB_TYPE_OPTIONS = ["Full-time", "Part-time", "Contract", "Internship", "Temporary"];
// JOB_LOCATION_OPTIONS can be free text, or pre-defined if desired

const statusBadgeVariant = (status) => {
  switch (status) {
    case "Open": return "default";
    case "Closed": return "secondary";
    case "Filled": return "outline"; 
    case "Draft": return "secondary";
    default: return "secondary";
  }
};

export default function JobsPage() {
  const { toast } = useToast();
  // Use Zustand stores
  const jobs = useJobStore((state) => state.jobs);
  const addJob = useJobStore((state) => state.addJob);
  const updateJob = useJobStore((state) => state.updateJob);
  const deleteJob = useJobStore((state) => state.deleteJob);
  const initializeJobs = useJobStore((state) => state._initializeJobs);

  const departments = useDepartmentStore((state) => state.departments);
  const DEPARTMENTS_OPTIONS = departments.map(dept => dept.name);

  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [selectedJob, setSelectedJob] = React.useState(null);

  React.useEffect(() => {
    initializeJobs(); // Ensure store is initialized
  }, [initializeJobs]);

  const handleAddJobOpen = () => {
    setSelectedJob(null);
    setIsAddDialogOpen(true);
  };

  const handleEditJobOpen = (job) => {
    setSelectedJob(job);
    setIsEditDialogOpen(true);
  };

  const handleDeleteJobOpen = (job) => {
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
  };

  const handleViewJobOpen = (job) => {
    setSelectedJob(job);
    setIsViewDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setIsViewDialogOpen(false);
    setSelectedJob(null);
  };

  const handleSaveJob = (jobData) => {
    if (selectedJob && selectedJob.id) {
      // Editing existing job
      updateJob({ ...jobData, id: selectedJob.id });
      toast({ title: "Job Updated", description: `"${jobData.title}" has been updated.` });
    } else {
      // Adding new job
      const newId = `JOB${String(Date.now()).slice(-4)}${String(jobs.length + 1).padStart(3, '0')}`;
      const newJob = {
        ...jobData,
        id: newId,
        postedDate: jobData.postedDate || new Date().toISOString().split('T')[0],
      };
      addJob(newJob);
      toast({ title: "Job Posted", description: `"${jobData.title}" has been added.` });
    }
    handleDialogClose();
  };

  const handleConfirmDelete = () => {
    if (selectedJob) {
      deleteJob(selectedJob.id);
      toast({ title: "Job Deleted", description: `"${selectedJob.title}" has been removed.`, variant: "destructive" });
    }
    handleDialogClose();
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col gap-y-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BriefcaseBusiness className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl">Manage Job Postings</CardTitle>
            </div>
            <CardDescription>
              View, create, update, and manage job openings.
            </CardDescription>
          </div>
          <Button onClick={handleAddJobOpen} className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" />
            Post New Job
          </Button>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-border rounded-lg bg-card/50">
              <BriefcaseBusiness className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold text-muted-foreground">
                No Job Postings Yet
              </p>
              <p className="text-sm text-muted-foreground">
                Click "Post New Job" to create your first job opening.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onEdit={() => handleEditJobOpen(job)}
                  onDelete={() => handleDeleteJobOpen(job)}
                  onViewDetails={() => handleViewJobOpen(job)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedJob ? "Edit Job Posting" : "Post New Job"}</DialogTitle>
            <DialogDescription>
              {selectedJob ? "Update the details of the job posting." : "Fill in the details to create a new job posting."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[70vh] overflow-y-auto pr-2">
            <JobForm
              onSubmit={handleSaveJob}
              initialData={selectedJob}
              onCancel={handleDialogClose}
              departmentOptions={DEPARTMENTS_OPTIONS.length > 0 ? DEPARTMENTS_OPTIONS : ["Default Department"]}
              statusOptions={JOB_STATUS_OPTIONS}
              typeOptions={JOB_TYPE_OPTIONS}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedJob?.title}</DialogTitle>
            <DialogDescription>
              {selectedJob?.department} | {selectedJob?.location} | {selectedJob?.type}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <h3 className="font-semibold text-lg mb-3">Job Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div className="flex items-start">
                  <BriefcaseBusiness className="h-4 w-4 mr-2 mt-1 shrink-0 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Department:</span>
                    <span className="text-muted-foreground ml-1">{selectedJob?.department || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1 shrink-0 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Location:</span>
                    <span className="text-muted-foreground ml-1">{selectedJob?.location || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <Briefcase className="h-4 w-4 mr-2 mt-1 shrink-0 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Type:</span>
                    <span className="text-muted-foreground ml-1">{selectedJob?.type || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <CalendarDays className="h-4 w-4 mr-2 mt-1 shrink-0 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Posted:</span>
                    <span className="text-muted-foreground ml-1">
                      {selectedJob?.postedDate ? new Date(selectedJob.postedDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex items-start md:col-span-2">
                   <Info className="h-4 w-4 mr-2 mt-1 shrink-0 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className="ml-1">
                      {selectedJob?.status ? (
                        <Badge variant={statusBadgeVariant(selectedJob.status)}>
                          {selectedJob.status}
                        </Badge>
                      ) : <span className="text-muted-foreground">N/A</span>}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-4" />
            
            <div>
              <h3 className="font-semibold text-lg mb-1">Job Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedJob?.description || 'No description provided.'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Requirements</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedJob?.requirements || 'No requirements listed.'}</p>
            </div>
          </div>
           <DialogFooter className="mt-4 flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={handleDialogClose} className="w-full sm:w-auto">Close</Button>
            {selectedJob?.applicationLink && (
                <Button asChild className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                    <a href={selectedJob.applicationLink} target="_blank" rel="noopener noreferrer">
                        Apply Now <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                </Button>
            )}
            <Button onClick={() => { handleDialogClose(); handleEditJobOpen(selectedJob); }} className="w-full sm:w-auto">
                <Edit className="mr-2 h-4 w-4"/> Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={handleDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this job posting?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job posting:{" "}
              <strong>{selectedJob?.title}</strong>.
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
