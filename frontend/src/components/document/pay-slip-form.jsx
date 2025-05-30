
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

const paySlipFormSchema = z.object({
  employeeName: z.string().min(2, { message: "Employee name is required." }),
  employeeId: z.string().min(1, { message: "Employee ID is required." }),
  employeeEmail: z.string().email({ message: "Please enter a valid email for the employee."}),
  department: z.string().min(2, { message: "Department is required." }),
  positionTitle: z.string().min(3, { message: "Position title is required." }),
  payPeriodStartDate: z.date({ required_error: "Pay period start date is required." }),
  payPeriodEndDate: z.date({ required_error: "Pay period end date is required." }),
  paymentDate: z.date({ required_error: "Payment date is required." }),
  basicSalary: z.preprocess(
    (val) => (val === "" ? undefined : parseFloat(String(val))), 
    z.number({ required_error: "Basic salary is required.", invalid_type_error: "Basic salary must be a number." })
     .positive({ message: "Basic salary must be positive." })
  ),
  allowancesStr: z.string().optional(),
  deductionsStr: z.string().optional(),
  companyName: z.string().min(2, { message: "Company name is required." }),
  companyAddress: z.string().optional(),
  companyLogoUrl: z.string().url({ message: "Please enter a valid URL for company logo."}).optional().or(z.literal('')),
}).refine(data => data.payPeriodEndDate >= data.payPeriodStartDate, {
    message: "Pay period end date must be after or same as start date.",
    path: ["payPeriodEndDate"],
});

export function PaySlipForm({ onSubmit, isLoading }) {
  const form = useForm({
    resolver: zodResolver(paySlipFormSchema),
    defaultValues: {
      employeeName: "",
      employeeId: "",
      employeeEmail: "",
      department: "",
      positionTitle: "",
      payPeriodStartDate: undefined,
      payPeriodEndDate: undefined,
      paymentDate: new Date(),
      basicSalary: "", // e.g. 50000 (INR)
      allowancesStr: "House Rent Allowance: 15000\nTravel Allowance: 5000\nSpecial Allowance: 10000", // Indian context amounts in INR
      deductionsStr: "Provident Fund (PF): 2500\nProfessional Tax (PT): 200\nIncome Tax (TDS): 5500", // Indian context amounts in INR
      companyName: "PESU Venture Labs",
      companyAddress: "PESU Venture Labs, PES University, 100 Feet Ring Road, Banashankari Stage III, Bengaluru, Karnataka 560085",
      companyLogoUrl: "https://www.pesuventurelabs.com/static/media/PVL%20Logo.9cc047dd.png", // Default PVL logo
    },
  });

  const handleSubmit = (values) => {
    const formattedValues = {
      ...values,
      payPeriodStartDate: format(values.payPeriodStartDate, "MMMM d, yyyy"),
      payPeriodEndDate: format(values.payPeriodEndDate, "MMMM d, yyyy"),
      paymentDate: format(values.paymentDate, "MMMM d, yyyy"),
      basicSalary: parseFloat(values.basicSalary) 
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
              <FormLabel>Employee Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Vijay Kumar" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee ID</FormLabel>
              <FormControl>
                <Input placeholder="e.g., PVL00234" {...field} />
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
                <Input type="email" placeholder="e.g., vijay.kumar@pesuventurelabs.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            name="positionTitle"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Position Title</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Software Development Engineer II" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="payPeriodStartDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Pay Period Start Date</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="payPeriodEndDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Pay Period End Date</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <FormField
            control={form.control}
            name="paymentDate"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Payment Date</FormLabel>
                <DatePicker date={field.value} setDate={field.onChange} />
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
          control={form.control}
          name="basicSalary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Basic Salary (INR)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 50000.00" {...field} step="0.01"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="allowancesStr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allowances (Optional, one per line: Name: Amount)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., House Rent Allowance: 15000"
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
          name="deductionsStr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deductions (Optional, one per line: Name: Amount)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Income Tax (TDS): 5500"
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
              <FormLabel>Company Address (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., PES University, Bengaluru" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyLogoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Logo URL (Optional)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://www.pesuventurelabs.com/static/media/PVL%20Logo.9cc047dd.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Pay Slip...
            </>
          ) : (
            "Generate Pay Slip"
          )}
        </Button>
      </form>
    </Form>
  );
}
