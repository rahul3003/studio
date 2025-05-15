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
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const offerLetterFormSchema = z.object({
  candidateName: z.string().min(2, { message: "Candidate name must be at least 2 characters." }),
  candidateEmail: z.string().email({ message: "Please enter a valid email address for the candidate." }),
  positionTitle: z.string().min(3, { message: "Position title must be at least 3 characters." }),
  department: z.string().min(2, { message: "Department must be at least 2 characters." }),
  startDate: z.date({ required_error: "Start date is required." }),
  salary: z.string().min(3, { message: "Salary details must be provided (e.g., ₹ 5,00,000 per year)." }), 
  reportingManager: z.string().min(1, { message: "Reporting manager is required." }), // Updated validation
  offerExpiryDate: z.date({ required_error: "Offer expiry date is required." }),
  companyName: z.string().min(2, { message: "Company name is required."}),
}).refine(data => data.offerExpiryDate >= data.startDate, {
    message: "Offer expiry date must be on or after the start date.",
    path: ["offerExpiryDate"],
});


export function OfferLetterForm({ onSubmit, isLoading, initialData, managerOptions = [] }) { 
  const form = useForm({
    resolver: zodResolver(offerLetterFormSchema),
    defaultValues: {
      salary: "₹ 7,00,000 per annum plus standard benefits", 
      companyName: "PESU Venture Labs",
      ...initialData,
      reportingManager: initialData?.reportingManager || "", // Ensure this is handled
      startDate: initialData?.startDate ? parseISO(initialData.startDate) : undefined,
      offerExpiryDate: initialData?.offerExpiryDate ? parseISO(initialData.offerExpiryDate) : undefined,
    },
  });

  React.useEffect(() => {
    if (initialData) {
        form.reset({
            ...initialData,
            reportingManager: initialData?.reportingManager || "",
            startDate: initialData?.startDate ? parseISO(initialData.startDate) : undefined,
            offerExpiryDate: initialData?.offerExpiryDate ? parseISO(initialData.offerExpiryDate) : undefined,
        });
    }
  }, [initialData, form]);


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
                <Input placeholder="e.g., Anjali Desai" {...field} />
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
                <Input type="email" placeholder="e.g., anjali.desai@example.com" {...field} />
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
                <Input placeholder="e.g., Senior Business Analyst" {...field} />
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
                <Input placeholder="e.g., Product Management" {...field} />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Reporting Manager" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {managerOptions.map((manager) => (
                      <SelectItem key={manager.value} value={manager.value}>
                        {manager.label}
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
              <FormLabel>Salary / Compensation</FormLabel>
              <FormControl>
                <Input placeholder="e.g., ₹ 8,00,000 per annum plus benefits" {...field} />
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
                <Input placeholder="e.g., PESU Venture Labs Pvt. Ltd." {...field} />
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