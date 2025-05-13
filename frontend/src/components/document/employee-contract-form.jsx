
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
      salary: "₹ 6,00,000 per annum, paid monthly", // Indian context
      workingHours: "10:00 AM to 6:00 PM, Monday to Friday", // Indian context
      probationPeriod: "6 months", // Indian context
      leaveEntitlement: "18 earned leave days, 12 casual/sick leave days per annum, plus public holidays", // Indian context
      confidentialityClause: "Standard company confidentiality and non-disclosure agreement applies as per Indian IT Act.",
      terminationNotice: "1 month by either party", // Indian context
      companyName: "PESU Venture Labs",
      companyAddress: "PESU Venture Labs, PES University, 100 Feet Ring Road, Banashankari Stage III, Bengaluru, Karnataka 560085",
      governingLaw: "Laws of India, State of Karnataka", // Indian context
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
                <Input placeholder="e.g., Rajesh Kumar Singh" {...field} />
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
                <Textarea placeholder="e.g., #123, 4th Main, Indiranagar, Bengaluru 560038" {...field} />
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
                <Input type="email" placeholder="e.g., employee@pesuventurelabs.com" {...field} />
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
                <Input placeholder="e.g., Senior Software Developer" {...field} />
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
                <Input placeholder="e.g., Technology" {...field} />
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
                <Input placeholder="e.g., ₹ 6,00,000 per annum, paid monthly" {...field} />
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
                <Input placeholder="e.g., 10 AM to 6 PM, Mon-Fri" {...field} />
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
                <Input placeholder="e.g., 6 months" {...field} />
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
                <Input placeholder="e.g., 18 earned leave days per year" {...field} />
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
                <Input placeholder="e.g., 1 month by either party" {...field} />
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
                <Input placeholder="e.g., PESU Venture Labs Pvt. Ltd." {...field} />
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
                <Textarea placeholder="e.g., PESU Venture Labs, PES University, Bengaluru" {...field} />
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
                <Input placeholder="e.g., Laws of India, State of Karnataka" {...field} />
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
