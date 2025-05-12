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
import { Textarea } from "@/components/ui/textarea";

const verificationLetterSchema = z.object({
  purpose: z.string().min(10, { message: "Purpose must be at least 10 characters." }).max(300, {message: "Purpose cannot exceed 300 characters."}),
  recipientName: z.string().min(2, {message: "Recipient name is required."}).optional(),
  recipientAddress: z.string().min(10, {message: "Recipient address is required."}).optional(),
});

export function VerificationLetterDialog({ isOpen, onClose, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(verificationLetterSchema),
    defaultValues: {
      purpose: "",
      recipientName: "",
      recipientAddress: "",
    },
  });

  const handleSubmit = (values) => {
    onSubmit(values);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Verification Letter</DialogTitle>
          <DialogDescription>
            Please provide the necessary details for your verification letter request.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose of the Letter</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Visa application, Bank loan, Rental agreement"
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
              name="recipientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Name/Organization (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Embassy of [Country], [Bank Name]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recipientAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Address (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Full address of the recipient"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Submit Request</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}