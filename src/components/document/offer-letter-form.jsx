
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
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2 } from "lucide-react";

const offerLetterFormSchema = z.object({
  candidateName: z.string().min(2, { message: "Candidate name must be at least 2 characters." }),
  candidateEmail: z.string().email({ message: "Please enter a valid email address for the candidate." }),
  positionTitle: z.string().min(3, { message: "Position title must be at least 3 characters." }),
  department: z.string().min(2, { message: "Department must be at least 2 characters." }),
  startDate: z.date({ required_error: "Start date is required." }),
  salary: z.string().min(3, { message: "Salary details must be provided (e.g., $50,000 per year)." }),
  reportingManager: z.string().min(2, { message: "Reporting manager name must be at least 2 characters." }),
  offerExpiryDate: z.date({ required_error: "Offer expiry date is required." }),
  companyName: z.string().min(2, { message: "Company name is required."}),
}).refine(data => data.offerExpiryDate > data.startDate, {
    message: "Offer expiry date must be after the start date.",
    path: ["offerExpiryDate"],
});


export function OfferLetterForm({ onSubmit, isLoading }) {
  const form = useForm({
    resolver: zodResolver(offerLetterFormSchema),
    defaultValues: {
      candidateName: "",
      candidateEmail: "",
      positionTitle: "",
      department: "",
      startDate: undefined,
      salary: "",
      reportingManager: "",
      offerExpiryDate: undefined,
      companyName: "HRMS Portal Inc.", // Default company name
    },
  });

  const handleSubmit = (values) => {
    const formattedValues = {
      ...values,
      startDate: format(values.startDate, "MMMM d, yyyy"),
      offerExpiryDate: format(values.offerExpiryDate, "MMMM d, yyyy"),
    };
    onSubmit(formattedValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="candidateName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Candidate Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="candidateEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Candidate Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="e.g., jane.doe@example.com" {...field} />
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
                <Input placeholder="e.g., Senior Software Engineer" {...field} />
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
          name="reportingManager"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reporting Manager</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Smith" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary / Compensation</FormLabel>
              <FormControl>
                <Input placeholder="e.g., $80,000 per annum plus benefits" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            name="offerExpiryDate"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Offer Expiry Date</FormLabel>
                <DatePicker date={field.value} setDate={field.onChange} />
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Your Company LLC" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Offer Letter"
          )}
        </Button>
      </form>
    </Form>
  );
}
