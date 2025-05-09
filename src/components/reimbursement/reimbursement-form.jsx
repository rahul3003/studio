
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import { FileText, UploadCloud, XCircle } from "lucide-react";

const reimbursementFormSchema = z.object({
  employeeName: z.string().min(1, { message: "Employee name is required." }),
  amount: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : parseFloat(String(val))),
    z.number({ required_error: "Amount is required.", invalid_type_error: "Amount must be a number." }).positive({ message: "Amount must be positive." })
  ),
  currency: z.string().min(1, { message: "Currency is required." }),
  description: z.string().min(5, { message: "Description must be at least 5 characters." }).max(200, { message: "Description cannot exceed 200 characters." }),
  submissionDate: z.date({ required_error: "Submission date is required." }),
  status: z.string().min(1, { message: "Status is required." }),
  fileName: z.string().optional().nullable(),
  reasonForRejection: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.status === "Rejected" && (!data.reasonForRejection || data.reasonForRejection.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Reason for rejection is required when status is 'Rejected'.",
      path: ["reasonForRejection"],
    });
  }
});


export function ReimbursementForm({
  onSubmit,
  initialData,
  onCancel,
  employeeOptions,
  currencyOptions,
  statusOptions,
}) {
  const { toast } = useToast();
  const [currentFileName, setCurrentFileName] = React.useState(initialData?.fileName || null);
  const fileInputRef = React.useRef(null);

  const form = useForm({
    resolver: zodResolver(reimbursementFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          submissionDate: initialData.submissionDate ? parseISO(initialData.submissionDate) : new Date(),
          amount: initialData.amount || "", // Ensure empty string if no amount for controlled input
        }
      : {
          employeeName: "",
          amount: "",
          currency: currencyOptions?.[0] || "",
          description: "",
          submissionDate: new Date(),
          status: statusOptions?.[0] || "", // Default to first status option
          fileName: null,
          reasonForRejection: "",
        },
  });

  const watchStatus = form.watch("status");

  React.useEffect(() => {
    if (initialData?.fileName) {
      setCurrentFileName(initialData.fileName);
    }
     // Reset form fields if initialData changes (e.g., when switching between add and edit)
    form.reset(initialData
      ? {
          ...initialData,
          submissionDate: initialData.submissionDate ? parseISO(initialData.submissionDate) : new Date(),
          amount: initialData.amount || "",
        }
      : {
          employeeName: "",
          amount: "",
          currency: currencyOptions?.[0] || "",
          description: "",
          submissionDate: new Date(),
          status: statusOptions?.[0] || "",
          fileName: null,
          reasonForRejection: "",
        });
    setCurrentFileName(initialData?.fileName || null);
  }, [initialData, form, currencyOptions, statusOptions]);


  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("fileName", file.name, { shouldValidate: true });
      setCurrentFileName(file.name);
      toast({ title: "File Selected", description: `${file.name} is ready for upload (mock).` });
    } else {
      // If user cancels file selection, revert to previous fileName if it existed
      form.setValue("fileName", initialData?.fileName || null, { shouldValidate: true });
      setCurrentFileName(initialData?.fileName || null);
    }
  };
  
  const handleRemoveFile = () => {
    form.setValue("fileName", null, { shouldValidate: true });
    setCurrentFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
    toast({ title: "File Removed", description: "Attachment has been cleared." });
  };

  const handleSubmit = (values) => {
    const submissionData = {
      ...values,
      submissionDate: format(values.submissionDate, "yyyy-MM-dd"),
      // Ensure amount is a number or null/undefined
      amount: values.amount === "" || values.amount === undefined || values.amount === null ? null : parseFloat(values.amount),
      fileName: currentFileName, // Use the state that tracks the file name
      reasonForRejection: values.status === "Rejected" ? values.reasonForRejection : null,
    };
    onSubmit(submissionData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="employeeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee Name</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {employeeOptions.map((employee) => (
                    <SelectItem key={employee} value={employee}>
                      {employee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 100.50" {...field} step="0.01" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencyOptions.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Briefly describe the expense."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="submissionDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Submission Date</FormLabel>
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
        
        {watchStatus === "Rejected" && (
          <FormField
            control={form.control}
            name="reasonForRejection"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason for Rejection</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Explain why the reimbursement was rejected."
                    className="resize-none"
                    rows={2}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormItem>
          <FormLabel>Attach Receipt (Optional)</FormLabel>
          <FormControl>
             <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto">
                  <UploadCloud className="mr-2 h-4 w-4" />
                  {currentFileName ? "Change File" : "Upload File"}
                </Button>
                <Input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
             </div>
          </FormControl>
           {currentFileName && (
            <div className="mt-2 flex items-center justify-between rounded-md border border-input p-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="truncate" title={currentFileName}>{currentFileName}</span>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile} className="h-6 w-6 text-destructive hover:bg-destructive/10">
                    <XCircle className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                </Button>
            </div>
          )}
          <FormMessage />
        </FormItem>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Save Changes" : "Submit Reimbursement"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
