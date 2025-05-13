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
import { Loader2, LocateFixed } from "lucide-react";

const CHECK_IN_TIME_OPTIONS = [
  "Before 9:30 AM",
  "9:30 AM - 10:30 AM",
  "After 10:30 AM",
];
const WORK_LOCATION_OPTIONS = {
  Office: "Work From Office",
  HomeWithPermission: "Work From Home (With Permission)",
  HomeWithoutPermission: "Work From Home (Without Permission)",
};

export function MorningCheckInDialog({ isOpen, onClose, onSave, userName }) {
  const { toast } = useToast();
  const [checkInTimeCategory, setCheckInTimeCategory] = React.useState(CHECK_IN_TIME_OPTIONS[0]);
  const [workLocation, setWorkLocation] = React.useState(Object.keys(WORK_LOCATION_OPTIONS)[0]);
  const [userCoordinates, setUserCoordinates] = React.useState(null);
  const [isLocating, setIsLocating] = React.useState(false);
  const [notes, setNotes] = React.useState("");
  const [isLeave, setIsLeave] = React.useState(false);

  const resetForm = React.useCallback(() => {
    setCheckInTimeCategory(CHECK_IN_TIME_OPTIONS[0]);
    setWorkLocation(Object.keys(WORK_LOCATION_OPTIONS)[0]);
    setUserCoordinates(null);
    setNotes("");
    setIsLeave(false);
    setIsLocating(false);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleDialogClose = React.useCallback(() => {
    onClose(false);
  }, [onClose]);

  const handleSubmit = React.useCallback(() => {
    if (isLeave) {
      onSave({ status: "Leave", notes: notes || "Marked as Leave" });
    } else {
      if (!workLocation) {
        toast({ title: "Validation Error", description: "Please select a work location.", variant: "destructive" });
        return;
      }
      if ((workLocation === "Office" || workLocation === "HomeWithPermission" || workLocation === "HomeWithoutPermission") && !userCoordinates && workLocation !== "Office") {
        // Optional: make location mandatory for WFH
        // toast({ title: "Location Required", description: "Please capture your location for WFH.", variant: "destructive" });
        // return;
      }
      onSave({
        status: "Present",
        checkInTimeCategory,
        workLocation,
        userCoordinates,
        notes,
      });
    }
    onClose(true);
  }, [isLeave, workLocation, userCoordinates, notes, onSave, onClose, toast]);

  const handleGetLocation = React.useCallback(() => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation Error", description: "Geolocation is not supported by your browser.", variant: "destructive" });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        toast({ title: "Location Captured", description: "Your current location has been recorded." });
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast({ title: "Location Error", description: `Could not get location: ${error.message}`, variant: "destructive" });
        setUserCoordinates(null);
        setIsLocating(false);
      }
    );
  }, [toast]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleDialogClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Morning Check-In {userName ? `for ${userName}` : ""}</DialogTitle>
          <DialogDescription>
            Please mark your attendance for today.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isLeaveCheckbox"
              checked={isLeave}
              onChange={(e) => setIsLeave(e.target.checked)}
              className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <Label htmlFor="isLeaveCheckbox" className="text-sm font-medium">Mark as Leave today?</Label>
          </div>

          {!isLeave && (
            <>
              <div className="space-y-2">
                <Label htmlFor="checkInTime">Check-In Time</Label>
                <Select value={checkInTimeCategory} onValueChange={setCheckInTimeCategory}>
                  <SelectTrigger id="checkInTime">
                    <SelectValue placeholder="Select check-in time" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHECK_IN_TIME_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workLocation">Work Location</Label>
                <Select value={workLocation} onValueChange={setWorkLocation}>
                  <SelectTrigger id="workLocation">
                    <SelectValue placeholder="Select work location" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(WORK_LOCATION_OPTIONS).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(workLocation === "Office" || workLocation === "HomeWithPermission" || workLocation === "HomeWithoutPermission") && (
                <div className="space-y-2">
                  <Label htmlFor="locationCapture">Capture Location</Label>
                  <Button variant="outline" onClick={handleGetLocation} disabled={isLocating} className="w-full">
                    {isLocating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LocateFixed className="mr-2 h-4 w-4" />}
                    {userCoordinates ? `Location Captured (${userCoordinates.latitude.toFixed(2)}, ${userCoordinates.longitude.toFixed(2)})` : "Get My Location"}
                  </Button>
                  {userCoordinates && <p className="text-xs text-muted-foreground">Lat: {userCoordinates.latitude.toFixed(4)}, Lon: {userCoordinates.longitude.toFixed(4)}</p>}
                </div>
              )}
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder={isLeave ? "Reason for leave..." : "Any specific details for today..."}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleDialogClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Save Check-In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}