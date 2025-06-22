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

const bankDetailsSchema = z.object({
  accountHolderName: z.string().min(2, { message: "Account holder name must be at least 2 characters" }),
  accountNumber: z.string()
    .min(9, { message: "Account number must be at least 9 digits" })
    .max(18, { message: "Account number cannot exceed 18 digits" })
    .regex(/^[0-9]+$/, { message: "Account number must contain only digits" }),
  ifsc: z.string()
    .length(11, { message: "IFSC code must be exactly 11 characters" })
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: "Invalid IFSC code format" }),
  bankName: z.string().min(2, { message: "Bank name must be at least 2 characters" }),
  branch: z.string().min(2, { message: "Branch name must be at least 2 characters" }),
});

const BankDetailsEditModal = ({ isOpen, onClose, initialData, onSubmit }) => {
  const form = useForm({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      accountHolderName: initialData?.accountHolderName || '',
      accountNumber: initialData?.accountNumber || '',
      ifsc: initialData?.ifsc || '',
      bankName: initialData?.bankName || '',
      branch: initialData?.branch || '',
    },
  });

  React.useEffect(() => {
    if (isOpen && initialData) {
      form.reset({
        accountHolderName: initialData.accountHolderName || '',
        accountNumber: initialData.accountNumber || '',
        ifsc: initialData.ifsc || '',
        bankName: initialData.bankName || '',
        branch: initialData.branch || '',
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
          <DialogTitle>Edit Bank Details</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="accountHolderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Holder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter account holder name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter account number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ifsc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IFSC Code</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter IFSC code" 
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter bank name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="branch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter branch name" {...field} />
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

export default BankDetailsEditModal; 