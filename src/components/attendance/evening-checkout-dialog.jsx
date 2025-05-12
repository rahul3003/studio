
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const CHECK_OUT_TIME_OPTIONS = [
  "Before 6:00 PM",
  "6:00 PM - 7:00 PM",
  "After 7:00 PM",
];

export function EveningCheckoutDialog({ isOpen, onClose, onSave, userName, currentNotes }) {
  const { toast } = useToast();
  const [checkOutTimeCategory, setCheckOutTimeCategory] = React.useState(CHECK_OUT_TIME_OPTIONS[0]);
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      // Initialize notes with existing notes from check-in if available
      setNotes(currentNotes || "");
      setCheckOutTimeCategory(CHECK_OUT_TIME_OPTIONS[0]); // Default checkout time
    }
  }, [isOpen, currentNotes]);

  const handleSubmit = () => {
    if (!checkOutTimeCategory) {
      toast({ title: "Validation Error", description: "Please select a check-out time.", variant: "destructive" });
      return;
    }
    onSave({
      checkOutTimeCategory,
      notes,
    });
    onClose(); // Close dialog after save
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Evening Check-Out {userName ? `for ${userName}` : ""}</DialogTitle>
          <DialogDescription>
            Please mark your check-out for today.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="checkOutTime">Check-Out Time</Label>
            <Select value={checkOutTimeCategory} onValueChange={setCheckOutTimeCategory}>
              <SelectTrigger id="checkOutTime">
                <SelectValue placeholder="Select check-out time" />
              </SelectTrigger>
              <SelectContent>
                {CHECK_OUT_TIME_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkout-notes">Notes (Optional)</Label>
            <Textarea
              id="checkout-notes"
              placeholder="Any final notes for the day..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Save Check-Out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
