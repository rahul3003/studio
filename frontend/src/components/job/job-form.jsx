"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { useToast } from "../../hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

const jobFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  requirements: z.string().min(10, { message: "Requirements must be at least 10 characters." }),
  department: z.string().min(1, { message: "Department is required." }),
  location: z.string().min(1, { message: "Location is required." }),
  type: z.enum([
    "FULL_TIME_JOB",
    "PART_TIME_JOB",
    "CONTRACT_JOB",
    "INTERNSHIP_JOB",
    "TEMPORARY_JOB"
  ], {
    required_error: "Job type is required.",
  }),
  status: z.enum(["OPEN", "CLOSED", "FILLED", "DRAFT"], {
    required_error: "Status is required.",
  }),
  applicationLink: z.string().url({ message: "Please enter a valid URL." }).optional(),
});

// Add a helper function to format job type for display
const formatJobType = (type) => {
  const typeMap = {
    "FULL_TIME_JOB": "Full Time",
    "PART_TIME_JOB": "Part Time",
    "CONTRACT_JOB": "Contract",
    "INTERNSHIP_JOB": "Internship",
    "TEMPORARY_JOB": "Temporary"
  };
  return typeMap[type] || type;
};

export function JobForm({
  onSubmit,
  initialData,
  onCancel,
  departmentOptions,
  statusOptions,
  typeOptions,
}) {
  const { toast } = useToast();
  
  // Create default values object
  const defaultValues = React.useMemo(() => {
    if (initialData) {
      return {
        ...initialData,
        status: initialData.status || "DRAFT",
        type: initialData.type || "FULL_TIME_JOB",
      };
    }
    return {
      title: "",
      description: "",
      requirements: "",
      department: "",
      location: "",
      type: "FULL_TIME_JOB",
      status: "DRAFT",
      applicationLink: "",
    };
  }, [initialData]);

  const form = useForm({
    resolver: zodResolver(jobFormSchema),
    defaultValues,
  });
  
  React.useEffect(() => {
     // Reset form fields if initialData changes
    form.reset(initialData
      ? {
          ...initialData,
          departmentId: initialData.departmentId || initialData.department?.id || "",
          postedDate: initialData.postedDate ? parseISO(initialData.postedDate) : undefined,
          applicationLink: initialData.applicationLink || "",
        }
      : {
          title: "",
          departmentId: "",
          location: "",
          type: "",
          status: statusOptions?.[0] || "",
          applicationLink: "",
          description: "",
          requirements: "",
          postedDate: new Date(),
        });
  }, [initialData, form, departmentOptions, statusOptions, typeOptions]);


  const handleSubmit = (values) => {
    const submissionData = {
      ...values,
      postedDate: values.postedDate ? format(values.postedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      applicationLink: values.applicationLink || null, // Store empty string as null
    };
    onSubmit(submissionData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Software Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="departmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departmentOptions.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.label}
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
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Remote, New York, NY" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {typeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatJobType(type)}
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="applicationLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application Link (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., https://company.com/apply/job123" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="postedDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Posted Date</FormLabel>
                <DatePicker date={field.value} setDate={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
        />


        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed description of the job responsibilities."
                  className="resize-none"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requirements</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List key skills, experience, and qualifications."
                  className="resize-none"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Save Changes" : "Post Job"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
