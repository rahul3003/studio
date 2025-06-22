import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const personalInfoSchema = z.object({
  phone: z.string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .regex(/^[0-9]+$/, { message: "Phone number must contain only digits" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  personalEmail: z.string().email({ message: "Invalid email address" }),
  city: z.string().min(2, { message: "City must be at least 2 characters" }),
});

const PersonalInfoEditModal = ({ isOpen, onClose, initialData, onSubmit }) => {
  const form = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      personalEmail: initialData?.personalEmail || '',
      city: initialData?.city || '',
    },
  });

  React.useEffect(() => {
    if (isOpen && initialData) {
      form.reset({
        phone: initialData.phone || '',
        address: initialData.address || '',
        personalEmail: initialData.personalEmail || '',
        city: initialData.city || '',
      });
    }
  }, [isOpen, initialData, form]);

  const handleSubmit = async (values) => {
    await onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Personal Information</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
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
                    <Input placeholder="Enter address" {...field} />
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
                    <Input type="email" placeholder="Enter personal email" {...field} />
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
                    <Input placeholder="Enter city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalInfoEditModal; 