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
  FormDescription,
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
  role: z.enum(["SUPERADMIN", "ADMIN", "MANAGER", "HR", "ACCOUNTS", "EMPLOYEE"], {
    required_error: "Role is required.",
  }),
  designation: z.enum([
    "INTERN",
    "TRAINEE",
    "JUNIOR_DEVELOPER",
    "ASSOCIATE_DEVELOPER",
    "DEVELOPER",
    "SENIOR_DEVELOPER",
    "TEAM_LEAD",
    "PRINCIPAL_ENGINEER",
    "JUNIOR_DESIGNER",
    "DESIGNER",
    "SENIOR_DESIGNER",
    "HR_EXECUTIVE",
    "SENIOR_HR",
    "SALES_REP",
    "SENIOR_SALES_REP",
    "ANALYST",
    "SENIOR_ANALYST",
    "ASSOCIATE_QA",
    "QA_ENGINEER",
    "SENIOR_QA",
    "DEVOPS_ENGINEER_DESIGNATION",
    "SENIOR_DEVOPS_ENGINEER",
    "PRODUCT_MANAGER",
    "SENIOR_PRODUCT_MANAGER",
    "MANAGER_DESIGNATION",
    "DIRECTOR",
    "ADMINISTRATOR",
    "ACCOUNTANT_DESIGNATION"
  ], {
    required_error: "Designation is required.",
  }),
  department: z.string().min(1, { message: "Department is required." }),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    required_error: "Gender is required.",
  }),
  joinDate: z.date({ required_error: "Join date is required." }),
  status: z.enum(["ACTIVE", "ON_LEAVE", "TERMINATED", "PROBATION", "RESIGNED"], {
    required_error: "Status is required.",
  }),
  employeeType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACTOR", "INTERN", "TEMPORARY"], {
    required_error: "Employee type is required.",
  }),
  salary: z.string().min(3, {message: "Salary must be provided (e.g., ₹ XXXXX per annum)."}).optional(),
  reportingManagerId: z.string().min(1, { message: "Reporting Manager is required." }),
});

const GENDER_OPTIONS = ["MALE", "FEMALE", "OTHER"];
export const EMPLOYEE_TYPE_OPTIONS = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACTOR",
  "INTERN",
  "TEMPORARY"
];

const designationLabelMap = {
  INTERN: "Intern",
  TRAINEE: "Trainee",
  JUNIOR_DEVELOPER: "Junior Developer",
  ASSOCIATE_DEVELOPER: "Associate Developer",
  DEVELOPER: "Developer",
  SENIOR_DEVELOPER: "Senior Developer",
  TEAM_LEAD: "Team Lead",
  PRINCIPAL_ENGINEER: "Principal Engineer",
  JUNIOR_DESIGNER: "Junior Designer",
  DESIGNER: "Designer",
  SENIOR_DESIGNER: "Senior Designer",
  HR_EXECUTIVE: "HR Executive",
  SENIOR_HR: "Senior HR",
  SALES_REP: "Sales Rep",
  SENIOR_SALES_REP: "Senior Sales Rep",
  ANALYST: "Analyst",
  SENIOR_ANALYST: "Senior Analyst",
  ASSOCIATE_QA: "Associate QA",
  QA_ENGINEER: "QA Engineer",
  SENIOR_QA: "Senior QA",
  DEVOPS_ENGINEER_DESIGNATION: "DevOps Engineer",
  SENIOR_DEVOPS_ENGINEER: "Senior DevOps Engineer",
  PRODUCT_MANAGER: "Product Manager",
  SENIOR_PRODUCT_MANAGER: "Senior Product Manager",
  MANAGER_DESIGNATION: "Manager",
  DIRECTOR: "Director",
  ADMINISTRATOR: "Administrator",
  ACCOUNTANT_DESIGNATION: "Accountant"
};

export function EmployeeForm({
  onSubmit,
  initialData,
  onCancel,
  rolesOptions, 
  designationOptions,
  departmentsOptions,
  statusOptions,
  employeeTypeOptions,
  reportingManagerOptions,
}) {
  const { toast } = useToast();
  
  // Create default values object
  const defaultValues = React.useMemo(() => {
    if (initialData) {
      return {
          ...initialData,
          joinDate: initialData.joinDate 
          ? (typeof initialData.joinDate === 'string' 
              ? parseISO(initialData.joinDate) 
              : initialData.joinDate)
          : new Date(),
        gender: initialData.gender || "OTHER",
        employeeType: initialData.employeeType || "FULL_TIME",
        salary: initialData.salary || "",
        reportingManagerId: initialData.reportingManagerId || "",
        status: initialData.status || "ACTIVE",
        department: initialData.department || "",
        designation: initialData.designation || "INTERN",
        role: initialData.role || "EMPLOYEE"
      };
    }
    return {
          name: "",
          email: "",
          role: "EMPLOYEE",
          designation: "INTERN",
          department: "",
          gender: "OTHER",
          joinDate: new Date(),
          status: "ACTIVE",
          employeeType: "FULL_TIME",
          salary: "",
          reportingManagerId: "",
    };
  }, [initialData]);

  const form = useForm({
    resolver: zodResolver(employeeFormSchema),
    defaultValues,
  });
  
  // Reset form when initialData changes
  React.useEffect(() => {
    form.reset(defaultValues);
  }, [initialData, form, defaultValues]);

  const handleSubmit = (values) => {
    // Transform department value to match backend expectation
    const transformedValues = {
      ...values,
      departmentId: values.department, // Map department to departmentId
      joinDate: format(values.joinDate, "yyyy-MM-dd"),
    };
    delete transformedValues.department; // Remove the old department field
    onSubmit(transformedValues);
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
                        {designationLabelMap[designation] || designation}
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
            name="reportingManagerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reporting Manager</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reporting manager" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {reportingManagerOptions.map((manager) => (
                      <SelectItem key={manager.id} value={manager.value}>
                        {manager.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the employee who will be the reporting manager
                </FormDescription>
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