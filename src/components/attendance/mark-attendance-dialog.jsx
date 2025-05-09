
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
import { format } from "date-fns";

export function MarkAttendanceDialog({
  isOpen,
  onClose,
  selectedDate,
  currentAttendance,
  onSave,
  statusOptions = ["Present", "Absent", "Leave"], // Default options
}) {
  const [status, setStatus] = React.useState(currentAttendance?.status || statusOptions[0]);
  const [notes, setNotes] = React.useState(currentAttendance?.notes || "");

  React.useEffect(() => {
    if (currentAttendance) {
      setStatus(currentAttendance.status || statusOptions[0]);
      setNotes(currentAttendance.notes || "");
    } else {
      setStatus(statusOptions[0]);
      setNotes("");
    }
  }, [currentAttendance, isOpen, statusOptions]);

  const handleSubmit = () => {
    onSave(selectedDate, status, notes);
  };

  if (!isOpen || !selectedDate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
          <DialogDescription>
            Update attendance for {format(selectedDate, "PPP")}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any relevant notes..."
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
            Save Attendance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    