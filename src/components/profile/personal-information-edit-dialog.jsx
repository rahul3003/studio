
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

const personalInfoSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format." }), // Basic international phone validation
  address: z.string().min(10, { message: "Address must be at least 10 characters." }),
  profilePhotoUrl: z.string().url({ message: "Invalid URL for profile photo." }).optional().or(z.literal('')),
  idProofFileName: z.string().min(3, { message: "ID proof file name is too short." }).optional().or(z.literal('')),
  addressProofFileName: z.string().min(3, {message: "Address proof file name is too short."}).optional().or(z.literal('')),
});

export function PersonalInformationEditDialog({ isOpen, onClose, onSubmit, initialData }) {
  const form = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      profilePhotoUrl: initialData?.profilePhotoUrl || "",
      idProofFileName: initialData?.idProofFileName || "",
      addressProofFileName: initialData?.addressProofFileName || "",
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        phone: initialData.phone,
        address: initialData.address,
        profilePhotoUrl: initialData.profilePhotoUrl || "",
        idProofFileName: initialData.idProofFileName || "",
        addressProofFileName: initialData.addressProofFileName || "",
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values) => {
    onSubmit(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Personal Information</DialogTitle>
          <DialogDescription>
            Update your personal details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
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
                      placeholder="Your residential address"
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
              name="profilePhotoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Photo URL (Mock)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/photo.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="idProofFileName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Proof File Name (Mock)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., AadhaarCard.pdf" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="addressProofFileName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Proof File Name (Mock)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., RentalAgreement.pdf" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
