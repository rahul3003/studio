"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { useEffect } from "react";

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
import { useDepartmentStore } from '@/store/departmentStore';
import { useProjectStore } from '@/store/projectStore';
import { s3Service } from "@/services/s3Service";

const reimbursementFormSchema = z.object({
  type: z.enum(["self", "onbehalf"]),
  submissionDate: z.string().min(1, { message: "Date is required." }),
  description: z.string().min(5, { message: "Description must be at least 5 characters." }),
  vendor: z.string().min(1, { message: "Vendor is required." }),
  departmentId: z.string().min(1, { message: "Department is required." }),
  projectId: z.string().min(1, { message: "Project is required." }),
  mainCategory: z.string().min(1, { message: "Main category is required." }),
  subCategory: z.string().min(1, { message: "Subcategory is required." }),
  amount: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : parseFloat(String(val))),
    z.number({ required_error: "Amount is required." }).positive({ message: "Amount must be positive." })
  ),
  currency: z.string().default("INR"),
  onBehalf: z.string().min(1),
  payee: z.string().min(1),
  advance: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : parseFloat(String(val))),
    z.number({ invalid_type_error: "Advance must be a number." }).min(0, { message: "Advance must be 0 or more." })
  ),
  approverId: z.string().min(1, { message: "Approver is required." }),
  status: z.string().min(1, { message: "Status is required." }),
  fileName: z.string().optional(),
  fileUrl: z.string().optional(),
  comments: z.array(z.any()).optional(),
  history: z.array(z.any()).optional(),
  appliedBy: z.object({
    id: z.string(),
    name: z.string()
  }).optional(),
});

const mainCategories = [
  { value: 'Procurement', label: 'Procurement' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Other', label: 'Other' },
];
const subCategories = {
  Procurement: [
    { value: 'Hardware/Spares', label: 'Hardware/Spares' },
    { value: 'Tools and Subscriptions', label: 'Tools and Subscriptions' },
    { value: 'Stationery and miscellaneous', label: 'Stationery and miscellaneous' },
    { value: 'Food and beverages', label: 'Food and beverages' },
  ],
  Sales: [
    { value: 'Gift and entertainment', label: 'Gift and entertainment' },
    { value: 'Others', label: 'Others (Please Specify)' },
  ],
  Travel: [
    { value: 'Travel and Tool', label: 'Travel and Tool' },
  ],
  Other: [
    { value: 'Other', label: 'Other' },
  ],
};

export function ReimbursementForm({
  onSubmit,
  initialData,
  onCancel,
  employeeList = [],
  currentUser,
  defaultApproverId,
  ...props
}) {
  // Defensive checks

  console.log("currentUser", currentUser);
  if (!currentUser || !currentUser.id) {
    return <div className="text-red-500 p-4">No current user found. Please log in or select a user.</div>;
  }
  if (!employeeList || !Array.isArray(employeeList) || employeeList.length === 0) {
    return <div className="text-red-500 p-4">No employees found. Please add employees first.</div>;
  }

  const { toast } = useToast();
  const { departments, fetchDepartments } = useDepartmentStore();
  const { projects } = useProjectStore();
  const [currentFileName, setCurrentFileName] = React.useState(initialData?.fileName || null);
  const fileInputRef = React.useRef(null);
  const [mainCategory, setMainCategory] = React.useState(initialData?.mainCategory || 'Procurement');

  // Fetch departments if not loaded
  useEffect(() => {
    if (!departments || departments.length === 0) {
      fetchDepartments();
    }
  }, [departments, fetchDepartments]);

  const form = useForm({
    resolver: zodResolver(reimbursementFormSchema),
    defaultValues: initialData || {
      type: "self",
      submissionDate: new Date().toISOString().split('T')[0],
      description: "",
      vendor: "",
      departmentId: departments?.[0]?.id || "",
      projectId: projects?.[0]?.id || "",
      mainCategory: 'Procurement',
      subCategory: '',
      amount: "",
      onBehalf: currentUser.id,
      payee: currentUser.id,
      advance: 0,
      approverId: defaultApproverId || "",
      status: "Pending",
      appliedBy: { id: currentUser.id, name: currentUser.name },
      comments: [],
      history: [
        {
          date: new Date().toISOString(),
          status: "Created",
          comment: "Initial creation"
        }
      ]
    },
  });

  const watchType = form.watch("type");
  const watchPayee = form.watch("payee");

  React.useEffect(() => {
    if (watchType === "self") {
      form.setValue("payee", currentUser.id);
      form.setValue("onBehalf", currentUser.id);
    } else if (watchType === "onbehalf" && !employeeList.find(e => e.id === watchPayee)) {
      form.setValue("payee", employeeList[0]?.id || "");
      form.setValue("onBehalf", currentUser.id);
    }
  }, [watchType, currentUser, employeeList, form, watchPayee]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Get presigned URL for upload
        const result = await s3Service.getPresignedUrl(
          file.name,
          file.type,
          'reimbursements'
        );
        console.log('Presigned URL result:', result);
        const presignedUrl = result?.data?.presignedUrl;
        const fileUrl = result?.data?.url;

        if (!presignedUrl) {
          toast({ title: "Upload Failed", description: "No presigned URL returned from server.", variant: "destructive" });
          return;
        }

        // Upload file to S3
        await s3Service.uploadFileDirectly(file, presignedUrl);

        // Update form with file details
        form.setValue("fileName", file.name, { shouldValidate: true });
        form.setValue("fileUrl", fileUrl, { shouldValidate: true });
        setCurrentFileName(file.name);
        
        toast({ 
          title: "File Uploaded", 
          description: `${file.name} has been uploaded successfully.` 
        });
      } catch (error) {
        console.error("File upload error:", error);
        toast({ 
          title: "Upload Failed", 
          description: "Failed to upload file. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      // If user cancels file selection, revert to previous fileName if it existed
      form.setValue("fileName", initialData?.fileName || null, { shouldValidate: true });
      form.setValue("fileUrl", initialData?.fileUrl || null, { shouldValidate: true });
      setCurrentFileName(initialData?.fileName || null);
    }
  };
  
  const handleRemoveFile = () => {
    form.setValue("fileName", null, { shouldValidate: true });
    form.setValue("fileUrl", null, { shouldValidate: true });
    setCurrentFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
    toast({ title: "File Removed", description: "Attachment has been cleared." });
  };

  const handleSubmit = (values) => {
    onSubmit(values);
  };

  // Handler for invalid form submission
  const onInvalid = (errors) => {
    const missingFields = Object.keys(errors)
      .map(key => errors[key]?.message || key)
      .join(', ');
    toast({
      title: "Missing or Invalid Fields",
      description: `Please check: ${missingFields}`,
      variant: "destructive"
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit, onInvalid)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Row 1: Type and Payee */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="self">Self</SelectItem>
                  <SelectItem value="onbehalf">On Behalf Of</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.watch("type") === "onbehalf" ? (
          <FormField
            control={form.control}
            name="payee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payee</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employeeList.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <div>
            <FormLabel>Payee</FormLabel>
            <Input value={currentUser.name} readOnly />
          </div>
        )}
        {/* Section 1: Basic Info */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="submissionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 100.50" {...field} step="0.01" value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="departmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""} required>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
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
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Section 2: Description & Vendor */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Briefly describe the expense."
                    className="resize-none"
                    rows={3}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vendor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Section 3: Category */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="mainCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Main Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select main category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mainCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
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
            name="subCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subcategory</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subCategories[mainCategory]?.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Section 4: Advance & Approver */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="advance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Advance</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 100.50" {...field} step="0.01" value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="approverId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Approver</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select approver" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employeeList
                      .filter(emp => emp.role && emp.role !== "EMPLOYEE")
                      .map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} ({emp.role})
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Status field: dropdown for non-employees, read-only for employees */}
          {currentUser.role !== "EMPLOYEE" ? (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {props.statusOptions?.map((status) => (
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
          ) : (
            <div>
              <FormLabel>Status</FormLabel>
              <Input value={form.watch("status") ?? "Pending"} readOnly />
            </div>
          )}
        </div>
        {/* Section 5: File Upload */}
        <div className="col-span-1 md:col-span-2">
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
        </div>
        <div className="col-span-1 md:col-span-2 flex justify-end space-x-2 pt-4">
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
