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
import { useToast } from "@/hooks/use-toast";
import { MapPin } from "lucide-react";


const CHECK_IN_TIME_OPTIONS = [
  "Before 9:30 AM",
  "9:30 AM - 10:30 AM",
  "After 10:30 AM",
];
const CHECK_OUT_TIME_OPTIONS = [
  "Before 6:00 PM",
  "6:00 PM - 7:00 PM",
  "After 7:00 PM",
];
const WORK_LOCATION_OPTIONS = {
  Office: "Work From Office",
  HomeWithPermission: "Work From Home (With Permission)",
  HomeWithoutPermission: "Work From Home (Without Permission)",
};
// Status options for the general dialog, excluding Holiday (as it's usually set by admin system-wide)
const STATUS_OPTIONS_GENERAL = ["Present", "Absent", "Leave"];


export function MarkAttendanceDialog({
  isOpen,
  onClose,
  selectedDate,
  currentAttendance, // This will now be the full record { status, notes, checkInTimeCategory, ... }
  onSave, // Expects onSave(date, { status, notes, checkInTimeCategory, ... })
  userName,
}) {
  const { toast } = useToast();

  const [status, setStatus] = React.useState(STATUS_OPTIONS_GENERAL[0]);
  const [notes, setNotes] = React.useState("");
  const [checkInTimeCategory, setCheckInTimeCategory] = React.useState(null);
  const [workLocation, setWorkLocation] = React.useState(null);
  const [checkOutTimeCategory, setCheckOutTimeCategory] = React.useState(null);
  // userCoordinates (for check-in) and checkOutCoordinates are view-only here, usually set by their respective dialogs.

  React.useEffect(() => {
    if (isOpen && selectedDate) {
      if (currentAttendance) {
        setStatus(currentAttendance.status || STATUS_OPTIONS_GENERAL[0]);
        setNotes(currentAttendance.notes || "");
        setCheckInTimeCategory(currentAttendance.checkInTimeCategory || null);
        setWorkLocation(currentAttendance.workLocation || null);
        setCheckOutTimeCategory(currentAttendance.checkOutTimeCategory || null);
      } else {
        // Defaults for a new entry via this dialog
        setStatus(STATUS_OPTIONS_GENERAL[0]);
        setNotes("");
        setCheckInTimeCategory(null);
        setWorkLocation(null);
        setCheckOutTimeCategory(null);
      }
    }
  }, [currentAttendance, isOpen, selectedDate]);

  const handleSubmit = () => {
    const attendanceData = {
      status,
      notes,
      checkInTimeCategory: status === "Present" ? checkInTimeCategory : null,
      workLocation: status === "Present" ? workLocation : null,
      checkOutTimeCategory: status === "Present" ? checkOutTimeCategory : null,
      userCoordinates: currentAttendance?.userCoordinates || null, // Preserve check-in coords
      checkOutCoordinates: currentAttendance?.checkOutCoordinates || null, // Preserve check-out coords
    };
    onSave(selectedDate, attendanceData);
    toast({
      title: "Attendance Updated",
      description: `Attendance for ${userName} on ${format(selectedDate, "PPP")} has been updated.`,
    });
    onClose();
  };

  if (!isOpen || !selectedDate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Mark/Edit Attendance {userName ? `for ${userName}` : ""}</DialogTitle>
          <DialogDescription>
            Update attendance details for {format(selectedDate, "PPP")}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status || ""} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS_GENERAL.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {status === "Present" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="checkInTimeEdit">Check-In Time Category</Label>
                <Select value={checkInTimeCategory || ""} onValueChange={setCheckInTimeCategory}>
                  <SelectTrigger id="checkInTimeEdit">
                    <SelectValue placeholder="Select check-in time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not Set</SelectItem>
                    {CHECK_IN_TIME_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workLocationEdit">Work Location</Label>
                <Select value={workLocation || ""} onValueChange={setWorkLocation}>
                  <SelectTrigger id="workLocationEdit">
                    <SelectValue placeholder="Select work location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not Set</SelectItem>
                    {Object.entries(WORK_LOCATION_OPTIONS).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {currentAttendance?.userCoordinates && (
                <div className="text-sm text-muted-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-1.5 text-blue-500"/> 
                  Check-In Loc: Lat {currentAttendance.userCoordinates.latitude.toFixed(3)}, Lon {currentAttendance.userCoordinates.longitude.toFixed(3)}
                  {/* TODO: Convert to City, State, Pincode using a service if needed */}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="checkOutTimeEdit">Check-Out Time Category</Label>
                <Select value={checkOutTimeCategory || ""} onValueChange={setCheckOutTimeCategory}>
                  <SelectTrigger id="checkOutTimeEdit">
                    <SelectValue placeholder="Select check-out time" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="">Not Set</SelectItem>
                    {CHECK_OUT_TIME_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentAttendance?.checkOutCoordinates && (
                <div className="text-sm text-muted-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-1.5 text-green-500"/> 
                  Check-Out Loc: Lat {currentAttendance.checkOutCoordinates.latitude.toFixed(3)}, Lon {currentAttendance.checkOutCoordinates.longitude.toFixed(3)}
                   {/* TODO: Convert to City, State, Pincode using a service if needed */}
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notesEdit">Notes (Optional)</Label>
            <Textarea
              id="notesEdit"
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
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}