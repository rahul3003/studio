
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

const experienceLetterFormSchema = z.object({
  employeeName: z.string().min(2, { message: "Employee name is required." }),
  employeeId: z.string().optional(),
  employeeEmail: z.string().email({ message: "Please enter a valid email for the employee."}),
  positionTitle: z.string().min(3, { message: "Last held position title is required." }),
  department: z.string().min(2, { message: "Department is required." }),
  joiningDate: z.date({ required_error: "Joining date is required." }),
  lastWorkingDate: z.date({ required_error: "Last working date is required." }),
  keyResponsibilities: z.string().min(20, { message: "Key responsibilities must be at least 20 characters." }).max(1000, {message: "Max 1000 chars."}),
  companyName: z.string().min(2, { message: "Company name is required." }),
  companyAddress: z.string().optional(),
  companyContact: z.string().optional(),
  issuingAuthorityName: z.string().min(2, { message: "Issuing authority name is required." }),
  issuingAuthorityTitle: z.string().min(3, { message: "Issuing authority title is required." }),
}).refine(data => data.lastWorkingDate >= data.joiningDate, {
    message: "Last working date must be after or same as joining date.",
    path: ["lastWorkingDate"],
});

export function ExperienceLetterForm({ onSubmit, isLoading }) {
  const form = useForm({
    resolver: zodResolver(experienceLetterFormSchema),
    defaultValues: {
      employeeName: "",
      employeeId: "",
      employeeEmail: "",
      positionTitle: "",
      department: "",
      joiningDate: undefined,
      lastWorkingDate: undefined,
      keyResponsibilities: "- Managed project A.\n- Developed feature B.\n- Coordinated with team C.",
      companyName: "PESU Venture Labs",
      companyAddress: "PESU Venture Labs, PES University, 100 Feet Ring Road, Banashankari Stage III, Bengaluru, Karnataka 560085",
      companyContact: "hr@pesuventurelabs.com / +91-XXXXXXXXXX",
      issuingAuthorityName: "Ms. Jane Smith",
      issuingAuthorityTitle: "HR Manager",
    },
  });

  const handleSubmit = (values) => {
    const formattedValues = {
      ...values,
      joiningDate: format(values.joiningDate, "MMMM d, yyyy"),
      lastWorkingDate: format(values.lastWorkingDate, "MMMM d, yyyy"),
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
                <Input placeholder="e.g., Alice Wonderland" {...field} />
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
              <FormLabel>Employee ID (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., EMP001" {...field} />
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
              <FormLabel>Last Held Position Title</FormLabel>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="joiningDate"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Joining Date</FormLabel>
                <DatePicker date={field.value} setDate={field.onChange} />
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="lastWorkingDate"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Last Working Date</FormLabel>
                <DatePicker date={field.value} setDate={field.onChange} />
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="keyResponsibilities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key Responsibilities/Contributions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Briefly list key responsibilities. Use '- ' for bullet points (AI will format)."
                  className="resize-none"
                  rows={4}
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
                <Input placeholder="e.g., Your Company LLC" {...field} />
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
                <Input placeholder="e.g., 123 Main St, Anytown, USA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Contact (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., hr@company.com or +1-234-567-8900" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="issuingAuthorityName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issuing Authority Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Mr. John Smith" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="issuingAuthorityTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issuing Authority Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Head of Human Resources" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Letter...
            </>
          ) : (
            "Generate Experience Letter"
          )}
        </Button>
      </form>
    </Form>
  );
}

