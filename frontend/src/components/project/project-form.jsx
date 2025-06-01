"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import moment from "moment";

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
import { useToast } from "@/hooks/use-toast";

const projectFormSchema = z.object({
  name: z.string().min(3, { message: "Project name must be at least 3 characters." }).max(100, { message: "Project name cannot exceed 100 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(500, { message: "Description cannot exceed 500 characters." }),
  projectManager: z.string().min(1, { message: "Project Manager is required." }),
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date().optional(),
  status: z.string().min(1, { message: "Status is required." }),
  teamMembersString: z.string().optional(),
}).refine(data => {
    if (data.startDate && data.endDate) {
      return data.endDate >= data.startDate;
    }
    return true;
  }, {
    message: "End date cannot be before start date.",
    path: ["endDate"],
});


export function ProjectForm({
  onSubmit,
  initialData,
  onCancel,
  statusOptions = [],
  employeeOptions = [], // For Project Manager selection
}) {
  const { toast } = useToast();

  // Robust projectManagerOptions
  const projectManagerOptions = React.useMemo(() => {
    if (!Array.isArray(employeeOptions)) return [];
    return employeeOptions
      .filter(emp => emp.value && emp.label)
      .map(emp => ({
        value: String(emp.value),
        label: emp.label
      }));
  }, [employeeOptions]);

  // Debug: log the options
  console.log("projectManagerOptions", projectManagerOptions);

  const safeStatusOptions = React.useMemo(() => {
    return Array.isArray(statusOptions) ? statusOptions : [];
  }, [statusOptions]);

  const form = useForm({
    resolver: zodResolver(projectFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          startDate: initialData.startDate ? parseISO(initialData.startDate) : undefined,
          endDate: initialData.endDate ? parseISO(initialData.endDate) : undefined,
          projectManager: initialData.projectManager || "",
          teamMembersString: initialData.teamMembersString || "",
        }
      : {
          name: "",
          description: "",
          projectManager: "",
          startDate: undefined,
          endDate: undefined,
          status: safeStatusOptions[0] || "PLANNING", // Default to first status option or PLANNING
          teamMembersString: "",
        },
  });

  const handleSubmit = (values) => {
    if (!values.projectManager || values.projectManager === "no-options") {
      alert("Please select a valid project manager.");
      return;
    }
    const submissionData = {
      ...values,
      projectManagerId: values.projectManager,
      startDate: values.startDate ? moment(values.startDate).toISOString() : null,
      endDate: values.endDate ? moment(values.endDate).toISOString() : null,
      teamMembersString: values.teamMembersString,
    };
    onSubmit(submissionData);
  };

  const renderStatusOptions = () => {
    if (!safeStatusOptions.length) {
      return <SelectItem value="no-options" disabled>No status options available</SelectItem>;
    }
    return safeStatusOptions.map((status) => (
      <SelectItem key={status} value={status || "PLANNING"}>
        {status || "Unknown Status"}
      </SelectItem>
    ));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. New Website Launch" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Briefly describe the project's objectives and scope."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="projectManager"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Manager</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Project Manager" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projectManagerOptions.length === 0 ? (
                    <SelectItem value="no-options" disabled>No project managers available</SelectItem>
                  ) : (
                    projectManagerOptions.map((pm) => (
                      <SelectItem key={pm.value} value={pm.value}>
                        {pm.label}
                    </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <DatePicker date={field.value} setDate={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date (Optional)</FormLabel>
                <DatePicker date={field.value} setDate={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {renderStatusOptions()}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="teamMembersString"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Members (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. John Doe, Jane Smith (comma-separated)" {...field} />
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
            {initialData ? "Save Changes" : "Add Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
