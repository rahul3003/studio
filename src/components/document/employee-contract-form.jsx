
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";

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
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2 } from "lucide-react";

const employeeContractFormSchema = z.object({
  employeeName: z.string().min(2, { message: "Employee name must be at least 2 characters." }),
  employeeAddress: z.string().min(10, { message: "Employee address is required." }),
  employeeEmail: z.string().email({ message: "Please enter a valid email for the employee."}),
  positionTitle: z.string().min(3, { message: "Position title must be at least 3 characters." }),
  department: z.string().min(2, { message: "Department must be at least 2 characters." }),
  startDate: z.date({ required_error: "Start date is required." }),
  salary: z.string().min(3, { message: "Salary details must be provided." }),
  workingHours: z.string().min(5, { message: "Working hours details are required." }),
  probationPeriod: z.string().optional(),
  leaveEntitlement: z.string().min(5, { message: "Leave entitlement details are required." }),
  confidentialityClause: z.string().optional(),
  terminationNotice: z.string().min(5, { message: "Termination notice period is required." }),
  companyName: z.string().min(2, { message: "Company name is required."}),
  companyAddress: z.string().min(10, { message: "Company address is required." }),
  governingLaw: z.string().min(3, { message: "Governing law/jurisdiction is required." }),
});

export function EmployeeContractForm({ onSubmit, isLoading }) {
  const form = useForm({
    resolver: zodResolver(employeeContractFormSchema),
    defaultValues: {
      employeeName: "",
      employeeAddress: "",
      employeeEmail: "",
      positionTitle: "",
      department: "",
      startDate: undefined,
      salary: "USD 60,000 per annum, paid monthly",
      workingHours: "9:00 AM to 5:00 PM, Monday to Friday",
      probationPeriod: "3 months",
      leaveEntitlement: "20 paid vacation days per annum, plus public holidays",
      confidentialityClause: "Standard company confidentiality and non-disclosure agreement applies.",
      terminationNotice: "4 weeks by either party",
      companyName: "PESU Venture Labs",
      companyAddress: "PESU Venture Labs, PES University, 100 Feet Ring Road, Banashankari Stage III, Bengaluru, Karnataka 560085",
      governingLaw: "State of Karnataka, India",
    },
  });

  const handleSubmit = (values) => {
    const formattedValues = {
      ...values,
      startDate: format(values.startDate, "MMMM d, yyyy"),
    };
    onSubmit(formattedValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="employeeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Michael Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="employeeAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee Address</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., 456 Residential Ave, Townsville, ST 54321" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="employeeEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="e.g., employee@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="positionTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Lead Software Developer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Engineering" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary & Payment Terms</FormLabel>
              <FormControl>
                <Input placeholder="e.g., $60,000 per annum, paid monthly" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="workingHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Working Hours</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 9 AM to 5 PM, Mon-Fri" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="probationPeriod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Probation Period (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 3 months" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="leaveEntitlement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Leave Entitlement</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 20 paid days per year" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confidentialityClause"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confidentiality Clause (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Standard non-disclosure terms apply." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="terminationNotice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Termination Notice Period</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 4 weeks by either party" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Your Company Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Address</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., 789 Corporate Blvd, Business City, ST 67890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="governingLaw"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Governing Law</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Laws of the State of New York" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Contract...
            </>
          ) : (
            "Generate Employee Contract"
          )}
        </Button>
      </form>
    </Form>
  );
}

