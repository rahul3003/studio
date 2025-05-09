
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, parseISO } from "date-fns";

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
  title: z.string().min(3, { message: "Job title must be at least 3 characters." }).max(100),
  department: z.string().min(1, { message: "Department is required." }),
  location: z.string().min(2, { message: "Location must be at least 2 characters." }).max(100),
  type: z.string().min(1, { message: "Job type is required." }),
  status: z.string().min(1, { message: "Status is required." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }).max(2000),
  requirements: z.string().min(10, { message: "Requirements must be at least 10 characters." }).max(2000),
  postedDate: z.date().optional(), // Optional in form, auto-set if not provided
});

export function JobForm({
  onSubmit,
  initialData,
  onCancel,
  departmentOptions,
  statusOptions,
  typeOptions,
}) {
  const form = useForm({
    resolver: zodResolver(jobFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          postedDate: initialData.postedDate ? parseISO(initialData.postedDate) : undefined,
        }
      : {
          title: "",
          department: "",
          location: "",
          type: "",
          status: statusOptions?.[0] || "", // Default to "Open" or first status
          description: "",
          requirements: "",
          postedDate: new Date(), // Default to today for new job
        },
  });
  
  React.useEffect(() => {
     // Reset form fields if initialData changes
    form.reset(initialData
      ? {
          ...initialData,
          postedDate: initialData.postedDate ? parseISO(initialData.postedDate) : undefined,
        }
      : {
          title: "",
          department: "",
          location: "",
          type: "",
          status: statusOptions?.[0] || "",
          description: "",
          requirements: "",
          postedDate: new Date(),
        });
  }, [initialData, form, statusOptions]);


  const handleSubmit = (values) => {
    const submissionData = {
      ...values,
      postedDate: values.postedDate ? format(values.postedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
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
            name="department"
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
                      <SelectItem key={dept} value={dept}>
                        {dept}
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
                        {type}
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
