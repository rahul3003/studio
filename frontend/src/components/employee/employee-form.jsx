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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";

const employeeFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  role: z.string().min(1, { message: "Job Title/Role is required." }),
  designation: z.string().min(1, { message: "Designation is required." }),
  department: z.string().min(1, { message: "Department is required." }),
  gender: z.string().min(1, { message: "Gender is required." }),
  joinDate: z.date({ required_error: "Join date is required." }),
  status: z.string().min(1, { message: "Status is required." }),
  employeeType: z.string().min(1, { message: "Employee type is required." }),
  salary: z.string().min(3, {message: "Salary must be provided (e.g., ₹ XXXXX per annum)."}).optional(),
  reportingManager: z.string().min(1, { message: "Reporting Manager is required." }),
});

const GENDER_OPTIONS = ["Male", "Female", "Other"];
export const EMPLOYEE_TYPE_OPTIONS = ["Full-time", "Part-time", "Contractor", "Intern"];

export function EmployeeForm({
  onSubmit,
  initialData,
  onCancel,
  rolesOptions, 
  designationOptions,
  departmentsOptions,
  statusOptions,
  employeeTypeOptions,
  reportingManagerOptions, // Added prop
}) {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          joinDate: initialData.joinDate 
                      ? (typeof initialData.joinDate === 'string' ? parseISO(initialData.joinDate) : initialData.joinDate) 
                      : undefined,
          gender: initialData.gender || "",
          employeeType: initialData.employeeType || "",
          salary: initialData.salary || "",
          reportingManager: initialData.reportingManager || "", // Initialize reportingManager
        }
      : {
          name: "",
          email: "",
          role: "",
          designation: "",
          department: "",
          gender: "",
          joinDate: undefined,
          status: "Active",
          employeeType: "",
          salary: "",
          reportingManager: "", // Default reportingManager
        },
  });
  
  React.useEffect(() => {
    form.reset(initialData
      ? {
          ...initialData,
          joinDate: initialData.joinDate 
                      ? (typeof initialData.joinDate === 'string' ? parseISO(initialData.joinDate) : initialData.joinDate) 
                      : undefined,
          gender: initialData.gender || "",
          employeeType: initialData.employeeType || "",
          salary: initialData.salary || "",
          reportingManager: initialData.reportingManager || "", // Reset reportingManager
        }
      : {
          name: "",
          email: "",
          role: "",
          designation: "",
          department: "",
          gender: "",
          joinDate: undefined,
          status: "Active",
          employeeType: "",
          salary: "",
          reportingManager: "", // Reset reportingManager
        });
  }, [initialData, form]);

  const handleSubmit = (values) => {
    onSubmit({
      ...values,
      joinDate: format(values.joinDate, "yyyy-MM-dd"), 
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Priya Sharma" {...field} />
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
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="e.g. priya.sharma@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title / Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job title/role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {rolesOptions.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
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
            name="designation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a designation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {designationOptions.map((designation) => (
                      <SelectItem key={designation} value={designation}>
                        {designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departmentsOptions.map((dept) => (
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
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GENDER_OPTIONS.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
                control={form.control}
                name="joinDate"
                render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Join Date</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
                control={form.control}
                name="employeeType"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Employee Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select employee type" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {employeeTypeOptions.map((type) => (
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
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary (e.g., ₹ XXXXX per annum)</FormLabel>
                  <FormControl>
                    <Input placeholder="₹ 6,00,000 per annum" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <FormField
            control={form.control}
            name="reportingManager"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reporting Manager</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Reporting Manager" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(reportingManagerOptions || []).map((manager) => (
                      <SelectItem key={manager} value={manager}>
                        {manager}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Save Changes" : "Add Employee"}
          </Button>
        </div>
      </form>
    </Form>
  );
}