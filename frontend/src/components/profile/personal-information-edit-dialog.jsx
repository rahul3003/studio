
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { UploadCloud, XCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const personalInfoSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format. (e.g., +919876543210)" }),
  address: z.string().min(10, { message: "Address must be at least 10 characters." }),
  personalEmail: z.string().email({ message: "Invalid personal email address." }).optional().or(z.literal('')),
  profilePhotoUrl: z.string().url({ message: "Invalid URL. Leave blank if uploading a new photo." }).optional().or(z.literal('')),
  profilePhotoFileName: z.string().optional().or(z.literal('')),
  idProofFileName: z.string().optional().or(z.literal('')),
  addressProofFileName: z.string().optional().or(z.literal('')),
  city: z.string().min(2, {message: "City name must be at least 2 characters."}).optional().or(z.literal('')),
});

export function PersonalInformationEditDialog({ isOpen, onClose, onSubmit, initialData }) {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      personalEmail: initialData?.personalEmail || "",
      profilePhotoUrl: initialData?.profilePhotoUrl || "",
      profilePhotoFileName: initialData?.profilePhotoFileName || "",
      idProofFileName: initialData?.idProofFileName || "",
      addressProofFileName: initialData?.addressProofFileName || "",
      city: initialData?.city || "",
    },
  });

  const profilePhotoFileRef = React.useRef(null);
  const idProofFileRef = React.useRef(null);
  const addressProofFileRef = React.useRef(null);

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        phone: initialData.phone,
        address: initialData.address,
        personalEmail: initialData.personalEmail || "",
        profilePhotoUrl: initialData.profilePhotoUrl || "",
        profilePhotoFileName: initialData.profilePhotoFileName || "",
        idProofFileName: initialData.idProofFileName || "",
        addressProofFileName: initialData.addressProofFileName || "",
        city: initialData.city || "",
      });
    }
  }, [initialData, form]);

  const handleFileChange = (event, fieldName, ref) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue(fieldName, file.name, { shouldValidate: true });
      toast({ title: "File Selected", description: `${file.name} (mock upload)` });
    } else {
      form.setValue(fieldName, initialData?.[fieldName] || "", { shouldValidate: true });
    }
  };

  const handleRemoveFile = (fieldName, ref) => {
    form.setValue(fieldName, "", { shouldValidate: true });
    if (ref.current) {
      ref.current.value = "";
    }
    toast({ title: "File Removed", description: `Attachment for ${fieldName.replace("FileName","")} cleared.`});
  };


  const handleSubmit = (values) => {
    onSubmit(values);
  };

  const watchProfilePhotoFileName = form.watch("profilePhotoFileName");
  const watchIdProofFileName = form.watch("idProofFileName");
  const watchAddressProofFileName = form.watch("addressProofFileName");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Personal Information</DialogTitle>
          <DialogDescription>
            Update your personal details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Priya Sharma" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="personalEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="priya.personal@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 98765 43210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Apt 101, Silicon Towers, Koramangala, Bengaluru, Karnataka 560034"
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
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Bengaluru" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profilePhotoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Photo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/photo.jpg (or upload below)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Profile Photo File Upload */}
            <FormItem>
              <FormLabel>Upload Profile Photo (Optional)</FormLabel>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => profilePhotoFileRef.current?.click()} className="w-full sm:w-auto">
                  <UploadCloud className="mr-2 h-4 w-4" />
                  {watchProfilePhotoFileName ? "Change Photo" : "Upload Photo"}
                </Button>
                <Input
                    type="file"
                    ref={profilePhotoFileRef}
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "profilePhotoFileName", profilePhotoFileRef)}
                    accept="image/*"
                />
              </div>
              {watchProfilePhotoFileName && (
                <div className="mt-2 flex items-center justify-between rounded-md border border-input p-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span className="truncate" title={watchProfilePhotoFileName}>{watchProfilePhotoFileName}</span>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveFile("profilePhotoFileName", profilePhotoFileRef)} className="h-6 w-6 text-destructive hover:bg-destructive/10">
                        <XCircle className="h-4 w-4" />
                        <span className="sr-only">Remove photo</span>
                    </Button>
                </div>
              )}
               <FormMessage />
            </FormItem>

            {/* ID Proof File Upload */}
             <FormItem>
              <FormLabel>ID Proof Document</FormLabel>
               <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => idProofFileRef.current?.click()} className="w-full sm:w-auto">
                  <UploadCloud className="mr-2 h-4 w-4" />
                  {watchIdProofFileName ? "Change ID Proof" : "Upload ID Proof"}
                </Button>
                <Input
                    type="file"
                    ref={idProofFileRef}
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "idProofFileName", idProofFileRef)}
                    accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
              {watchIdProofFileName && (
                <div className="mt-2 flex items-center justify-between rounded-md border border-input p-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span className="truncate" title={watchIdProofFileName}>{watchIdProofFileName}</span>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveFile("idProofFileName", idProofFileRef)} className="h-6 w-6 text-destructive hover:bg-destructive/10">
                        <XCircle className="h-4 w-4" />
                        <span className="sr-only">Remove ID Proof</span>
                    </Button>
                </div>
              )}
              <FormMessage />
            </FormItem>

            {/* Address Proof File Upload */}
            <FormItem>
              <FormLabel>Address Proof Document</FormLabel>
               <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => addressProofFileRef.current?.click()} className="w-full sm:w-auto">
                  <UploadCloud className="mr-2 h-4 w-4" />
                  {watchAddressProofFileName ? "Change Address Proof" : "Upload Address Proof"}
                </Button>
                <Input
                    type="file"
                    ref={addressProofFileRef}
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "addressProofFileName", addressProofFileRef)}
                    accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
              {watchAddressProofFileName && (
                <div className="mt-2 flex items-center justify-between rounded-md border border-input p-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span className="truncate" title={watchAddressProofFileName}>{watchAddressProofFileName}</span>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveFile("addressProofFileName", addressProofFileRef)} className="h-6 w-6 text-destructive hover:bg-destructive/10">
                        <XCircle className="h-4 w-4" />
                        <span className="sr-only">Remove Address Proof</span>
                    </Button>
                </div>
              )}
              <FormMessage />
            </FormItem>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

