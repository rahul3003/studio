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
import { Loader2, LocateFixed } from "lucide-react"; // Added Loader2, LocateFixed

const CHECK_OUT_TIME_OPTIONS = [
  "Before 6:00 PM",
  "6:00 PM - 7:00 PM",
  "After 7:00 PM",
];

export function EveningCheckoutDialog({ isOpen, onClose, onSave, userName, currentNotes }) {
  const { toast } = useToast();
  const [checkOutTimeCategory, setCheckOutTimeCategory] = React.useState(CHECK_OUT_TIME_OPTIONS[0]);
  const [notes, setNotes] = React.useState("");
  const [userCoordinates, setUserCoordinates] = React.useState(null); // For checkout location
  const [isLocating, setIsLocating] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setNotes(currentNotes || "");
      setCheckOutTimeCategory(CHECK_OUT_TIME_OPTIONS[0]); 
      setUserCoordinates(null); // Reset coordinates on open
      setIsLocating(false);
      // Automatically try to get location when dialog opens, if desired
      // handleGetLocation(); 
    }
  }, [isOpen, currentNotes]);

  const handleGetLocation = () => {
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
        // Do not toast success here to avoid showing employee their coords unless specified
        // toast({ title: "Location Captured", description: "Your current location has been recorded for checkout." });
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location for checkout:", error);
        toast({ title: "Location Error", description: `Could not get location: ${error.message}`, variant: "destructive" });
        setUserCoordinates(null); 
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = () => {
    if (!checkOutTimeCategory) {
      toast({ title: "Validation Error", description: "Please select a check-out time.", variant: "destructive" });
      return;
    }
    // Location capture is optional during checkout for now, can be made mandatory
    // if (workLocation !== "Office" && !userCoordinates) {
    //   toast({ title: "Location Required", description: "Please capture your location for checkout.", variant: "destructive" });
    //   return;
    // }
    onSave({
      checkOutTimeCategory,
      notes,
      userCoordinates, // Pass captured coordinates
    });
    onClose(); 
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Evening Check-Out {userName ? `for ${userName}` : ""}</DialogTitle>
          <DialogDescription>
            Please mark your check-out for today. Location will be captured.
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
            <Label htmlFor="locationCaptureCheckout">Capture Checkout Location</Label>
            <Button variant="outline" onClick={handleGetLocation} disabled={isLocating} className="w-full">
              {isLocating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LocateFixed className="mr-2 h-4 w-4" />}
              {userCoordinates ? `Location Updated` : "Update My Location"}
            </Button>
            {/* Do not display coordinates here to the employee as per request, but they are captured. */}
            {/* {userCoordinates && <p className="text-xs text-muted-foreground">Lat: {userCoordinates.latitude.toFixed(4)}, Lon: {userCoordinates.longitude.toFixed(4)} (Hidden from employee)</p>} */}
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