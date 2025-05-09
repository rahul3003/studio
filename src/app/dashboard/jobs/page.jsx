
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
import { PlusCircle, Edit, Trash2, BriefcaseBusiness, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { JobForm } from "@/components/job/job-form";
import { JobCard } from "@/components/job/job-card"; 
import { Badge } from "@/components/ui/badge";

// Initial mock job data
const initialJobs = [
  {
    id: "JOB001",
    title: "Senior Frontend Developer",
    department: "Technology",
    location: "Remote",
    type: "Full-time",
    description: "Join our dynamic team to build cutting-edge user interfaces with modern web technologies. You will be responsible for developing and maintaining web applications, collaborating with UI/UX designers and backend developers.",
    requirements: "5+ years of experience with React, Next.js, and TypeScript. Strong understanding of HTML, CSS, and JavaScript. Experience with RESTful APIs and version control (Git).",
    postedDate: "2024-07-20",
    status: "Open",
  },
  {
    id: "JOB002",
    title: "HR Operations Specialist",
    department: "Human Resources",
    location: "New York, NY (Hybrid)",
    type: "Full-time",
    description: "We are seeking an HR Operations Specialist to manage HRIS, payroll, benefits administration, and ensure compliance with labor regulations. This role involves process improvement and supporting HR projects.",
    requirements: "Bachelor's degree in HR or related field. 3+ years in HR operations. Proficient in HRIS software (e.g., Workday, SAP SuccessFactors). Excellent organizational and communication skills.",
    postedDate: "2024-07-15",
    status: "Open",
  },
  {
    id: "JOB003",
    title: "Product Marketing Manager",
    department: "Marketing",
    location: "San Francisco, CA (On-site)",
    type: "Full-time",
    description: "Drive the go-to-market strategy for our new product line. Conduct market research, develop product positioning, and create compelling marketing collateral.",
    requirements: "5+ years in product marketing, preferably in SaaS. Proven track record of successful product launches. Strong analytical and strategic thinking skills.",
    postedDate: "2024-06-28",
    status: "Closed",
  },
  {
    id: "JOB004",
    title: "Junior UX Designer",
    department: "Design",
    location: "Remote",
    type: "Internship",
    description: "Exciting internship opportunity for a budding UX designer. Work on real-world projects, create wireframes, prototypes, and conduct user research under the guidance of senior designers.",
    requirements: "Portfolio showcasing UX design projects. Familiarity with design tools (Figma, Sketch, Adobe XD). Understanding of user-centered design principles. Currently enrolled in or recently graduated from a design program.",
    postedDate: "2024-08-01",
    status: "Open",
  },
];

const JOB_STATUS_OPTIONS = ["Open", "Closed", "Filled", "Draft"];
const JOB_TYPE_OPTIONS = ["Full-time", "Part-time", "Contract", "Internship", "Temporary"];
const JOB_LOCATION_OPTIONS = ["Remote", "On-site", "Hybrid"]; // Simplified, form can allow free text
const DEPARTMENTS_OPTIONS = ["Technology", "Human Resources", "Marketing", "Sales", "Operations", "Design", "Finance"];


export default function JobsPage() {
  const { toast } = useToast();
  const [jobs, setJobs] = React.useState(initialJobs);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [selectedJob, setSelectedJob] = React.useState(null);

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
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === selectedJob.id ? { ...job, ...jobData } : job
        )
      );
      toast({ title: "Job Updated", description: `"${jobData.title}" has been updated.` });
    } else {
      // Adding new job
      const newId = `JOB${String(Date.now()).slice(-4)}${String(jobs.length + 1).padStart(3, '0')}`;
      const newJob = {
        ...jobData,
        id: newId,
        postedDate: jobData.postedDate || new Date().toISOString().split('T')[0], // Auto-set postedDate if not provided
      };
      setJobs((prevJobs) => [newJob, ...prevJobs]);
      toast({ title: "Job Posted", description: `"${jobData.title}" has been added.` });
    }
    handleDialogClose();
  };

  const handleConfirmDelete = () => {
    if (selectedJob) {
      setJobs((prevJobs) =>
        prevJobs.filter((job) => job.id !== selectedJob.id)
      );
      toast({ title: "Job Deleted", description: `"${selectedJob.title}" has been removed.`, variant: "destructive" }); // Changed selectedJob.name to selectedJob.title
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

      {/* Add/Edit Job Dialog */}
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
              departmentOptions={DEPARTMENTS_OPTIONS}
              statusOptions={JOB_STATUS_OPTIONS}
              typeOptions={JOB_TYPE_OPTIONS}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* View Job Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedJob?.title}</DialogTitle>
            <DialogDescription>
              {selectedJob?.department} | {selectedJob?.location} | {selectedJob?.type}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <h3 className="font-semibold text-lg mb-1">Job Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedJob?.description}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Requirements</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedJob?.requirements}</p>
            </div>
             <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                    Posted: {selectedJob?.postedDate ? new Date(selectedJob.postedDate).toLocaleDateString() : 'N/A'}
                </p>
                {selectedJob?.status && <Badge variant={selectedJob.status === 'Open' ? 'default' : 'secondary'}>{selectedJob.status}</Badge>}
             </div>
          </div>
           <DialogFooter className="mt-4">
            <Button variant="outline" onClick={handleDialogClose}>Close</Button>
            <Button onClick={() => { handleDialogClose(); handleEditJobOpen(selectedJob); }}>
                <Edit className="mr-2 h-4 w-4"/> Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
