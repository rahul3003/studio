"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEmployeeStore } from "@/store/employeeStore";

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

const departmentFormSchema = z.object({
  name: z.string().min(2, { message: "Department name must be at least 2 characters." }),
  headId: z.string().min(1, { message: "Head of Department is required." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(200, { message: "Description cannot exceed 200 characters." }),
});

export function DepartmentForm({
  onSubmit,
  initialData,
  onCancel,
}) {
  const { employees } = useEmployeeStore();
  
  // Filter employees who can be department heads (managers and above)
  const headOptions = React.useMemo(() => 
    employees
      .filter(emp => ['SUPERADMIN', 'ADMIN', 'MANAGER'].includes(emp.role))
      .map(emp => ({
        id: emp.id,
        value: emp.id,
        label: `${emp.name} (${emp.role})`
      }))
  , [employees]);

  const form = useForm({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          headId: initialData.headId,
          description: initialData.description,
        }
      : {
          name: "",
          headId: "",
          description: "",
        },
  });

  const handleSubmit = (values) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Technology" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="headId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Head of Department (HoD)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Head of Department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {headOptions.map((head) => (
                    <SelectItem key={head.id} value={head.id}>
                      {head.label}
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Briefly describe the department's responsibilities."
                  className="resize-none"
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
            {initialData ? "Save Changes" : "Add Department"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
