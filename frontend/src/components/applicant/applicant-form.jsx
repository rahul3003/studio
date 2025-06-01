"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileText, UploadCloud, XCircle } from "lucide-react";
import api from '@/services/api';

const applicantFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  jobId: z.string().min(1, { message: "Please select a job." }),
  assertifyScore: z.coerce.number().min(0).max(100),
  resume: z.any().optional(),
});

export function ApplicantForm({
  onSubmit,
  onCancel,
  initialData = {},
  jobOptions = [],
}) {
  const form = useForm({
    resolver: zodResolver(applicantFormSchema),
    defaultValues: {
      name: initialData.name || "",
      email: initialData.email || "",
      jobId: initialData.jobId || "",
      assertifyScore: initialData.assertifyScore || "",
      resume: initialData.resumeFile || initialData.resumeLink || null,
    },
  });

  const fileInputRef = React.useRef(null);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue("resume", file, { shouldValidate: true });
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    form.setValue("resume", null, { shouldValidate: true });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function handleFileUpload(file) {
    // Step 1: Get presigned URL from backend
    const { data: presignedData } = await api.post('/s3/presigned-url', {
      fileName: file.name,
      contentType: file.type,
    });
    console.log("presignedData-----", presignedData);
    // Step 2: Upload file to S3 using the presigned URL
    await fetch(presignedData.data.presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });
    // Step 3: Use presignedData.url as the resumeLink
    return presignedData.url || presignedData.data.url;
  }

  async function handleFormSubmit(values) {
    setUploading(true);
    let resumeLink = null;
    if (selectedFile) {
      try {
        resumeLink = await handleFileUpload(selectedFile);
      } catch (err) {
        setUploading(false);
        alert('Resume upload failed. Please try again.');
        return;
      }
    }
    setUploading(false);
    onSubmit({
      ...values,
      resumeFile: null, // Not needed anymore
      resumeLink: resumeLink || (typeof values.resume === "string" ? values.resume : null),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter applicant name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter applicant email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="jobId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {jobOptions.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title} ({typeof job.department === 'object' ? job.department.name : job.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="assertifyScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assertify Score</FormLabel>
                <FormControl>
                  <Input type="number" min={0} max={100} placeholder="e.g., 85" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="resume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resume Upload (Optional)</FormLabel>
              <div className="flex items-center gap-2">
                {selectedFile ? (
                  <div className="flex items-center justify-between w-full rounded-md border border-input p-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="truncate" title={selectedFile.name}>{selectedFile.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      className="h-6 w-6 text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="h-4 w-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto"
                  >
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload Resume
                  </Button>
                )}
                <Input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Supported formats: PDF, DOC, DOCX. You can also upload later.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-row justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
} 