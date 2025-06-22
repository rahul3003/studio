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

const secondaryDataSchema = z.object({
  currentPosition: z.string().min(2, { message: "Position must be at least 2 characters" }),
  currentRemuneration: z.string()
    .min(1, { message: "Remuneration is required" })
    .regex(/^₹\s*\d+(,\d{3})*(\.\d{2})?$/, { message: "Invalid remuneration format (e.g., ₹ 15,00,000)" }),
  annualLeaveBalance: z.number()
    .min(0, { message: "Leave balance cannot be negative" })
    .max(365, { message: "Leave balance cannot exceed 365 days" }),
  sickLeaveBalance: z.number()
    .min(0, { message: "Leave balance cannot be negative" })
    .max(365, { message: "Leave balance cannot exceed 365 days" }),
  totalAnnualLeave: z.number()
    .min(0, { message: "Total leave cannot be negative" })
    .max(365, { message: "Total leave cannot exceed 365 days" }),
  totalSickLeave: z.number()
    .min(0, { message: "Total leave cannot be negative" })
    .max(365, { message: "Total leave cannot exceed 365 days" }),
});

const SecondaryDataEditModal = ({ isOpen, onClose, initialData, onSubmit }) => {
  const form = useForm({
    resolver: zodResolver(secondaryDataSchema),
    defaultValues: {
      currentPosition: initialData?.currentPosition || '',
      currentRemuneration: initialData?.currentRemuneration || '',
      annualLeaveBalance: initialData?.annualLeaveBalance || 0,
      sickLeaveBalance: initialData?.sickLeaveBalance || 0,
      totalAnnualLeave: initialData?.totalAnnualLeave || 0,
      totalSickLeave: initialData?.totalSickLeave || 0,
    },
  });

  React.useEffect(() => {
    if (isOpen && initialData) {
      form.reset({
        currentPosition: initialData.currentPosition || '',
        currentRemuneration: initialData.currentRemuneration || '',
        annualLeaveBalance: initialData.annualLeaveBalance || 0,
        sickLeaveBalance: initialData.sickLeaveBalance || 0,
        totalAnnualLeave: initialData.totalAnnualLeave || 0,
        totalSickLeave: initialData.totalSickLeave || 0,
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
          <DialogTitle>Edit Secondary Information</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Position</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter current position" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentRemuneration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Remuneration</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter remuneration (e.g., ₹ 15,00,000)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="annualLeaveBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Leave Balance</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="365"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalAnnualLeave"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Annual Leave</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="365"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sickLeaveBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sick Leave Balance</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="365"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalSickLeave"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Sick Leave</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="365"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

export default SecondaryDataEditModal; 