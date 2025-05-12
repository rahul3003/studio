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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const nominateRewardSchema = z.object({
  nominee: z.string().min(1, { message: "Please select an employee to nominate." }),
  points: z.preprocess(
    val => parseInt(String(val), 10),
    z.number().min(5, { message: "Minimum 5 points." }).max(500, {message: "Maximum 500 points."})
  ).refine(val => val % 5 === 0, { message: "Points must be in multiples of 5."}),
  reasonCategory: z.string().min(1, { message: "Please select a reason category." }),
  feedbackText: z.string().min(20, { message: "Feedback must be at least 20 characters." }).max(500, {message: "Feedback cannot exceed 500 characters."}),
});


export function NominateRewardDialog({ 
    isOpen, 
    onClose, 
    onSubmit, 
    employeeList = [], 
    rewardCategories = [],
    currentUser,
    availablePointsToShare
}) {
  const form = useForm({
    resolver: zodResolver(nominateRewardSchema),
    defaultValues: {
      nominee: "",
      points: "",
      reasonCategory: "",
      feedbackText: "",
    },
  });

  React.useEffect(() => {
    if(isOpen) {
        form.reset({ // Reset form when dialog opens
            nominee: "",
            points: "",
            reasonCategory: "",
            feedbackText: "",
        });
    }
  }, [isOpen, form]);

  const handleSubmit = (values) => {
    if(parseInt(values.points, 10) > availablePointsToShare) {
        form.setError("points", {
            type: "manual",
            message: `You can only share up to ${availablePointsToShare} points this month.`
        });
        return;
    }
    onSubmit(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reward Someone</DialogTitle>
          <DialogDescription>
            Award points to a colleague for their contributions. Awarded by: {currentUser}.
            Available points to share: {availablePointsToShare}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="nominee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Award Points To</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employeeList.map(empName => (
                        <SelectItem key={empName} value={empName}>{empName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Points (Multiples of 5)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 50" {...field} step="5" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reasonCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why (Reason Category)</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rewardCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="feedbackText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Feedback/Comment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe why this person deserves recognition for the selected category."
                      className="resize-none"
                      rows={4}
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
              <Button type="submit">Submit Nomination</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
