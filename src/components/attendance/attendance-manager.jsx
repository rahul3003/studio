"use client";

import * as React from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { MorningCheckInDialog } from "./morning-check-in-dialog";
import { EveningCheckoutDialog } from "./evening-checkout-dialog";
import { useAttendanceStore } from "@/store/attendanceStore";

const AttendanceContext = React.createContext(null);

export function AttendanceProvider({ user, children }) {
  const { toast } = useToast();
  const [isMorningCheckInDialogOpen, setIsMorningCheckInDialogOpen] = React.useState(false);
  const [isEveningCheckoutDialogOpen, setIsEveningCheckoutDialogOpen] = React.useState(false);
  const [currentAttendanceNotes, setCurrentAttendanceNotes] = React.useState("");
  const [showCheckoutButton, setShowCheckoutButton] = React.useState(false);

  const getAttendanceForUserAndDate = useAttendanceStore(state => state.getAttendanceForUserAndDate);
  const markMorningCheckIn = useAttendanceStore(state => state.markMorningCheckIn);
  const markEveningCheckout = useAttendanceStore(state => state.markEveningCheckout);

  // Single check for attendance status
  React.useEffect(() => {
    if (!user?.name) return;

    const today = new Date();
    const todayDateString = format(today, "yyyy-MM-dd");
    const sessionCheckKey = `morningCheckInAttempted_${user.name}_${todayDateString}`;
    
    const alreadyAttemptedOrDismissed = sessionStorage.getItem(sessionCheckKey);
    const attendanceRecord = getAttendanceForUserAndDate(user.name, today);

    // Only show morning check-in if not already checked in and not previously attempted
    if (!attendanceRecord?.checkInTimeCategory && !alreadyAttemptedOrDismissed) {
      setIsMorningCheckInDialogOpen(true);
    }

    // Show checkout button if checked in but not checked out
    setShowCheckoutButton(!!(attendanceRecord?.checkInTimeCategory && !attendanceRecord?.checkOutTimeCategory));
    
    // Update notes
    setCurrentAttendanceNotes(attendanceRecord?.notes || "");
  }, [user?.name, getAttendanceForUserAndDate]);

  const handleSaveMorningCheckIn = React.useCallback((checkInData) => {
    if (!user?.name) return;

    markMorningCheckIn(user.name, new Date(), checkInData);
    toast({
      title: "Attendance Marked",
      description: `Your check-in for ${format(new Date(), "PPP")} has been recorded.`,
    });

    setIsMorningCheckInDialogOpen(false);
    setShowCheckoutButton(checkInData.status === "Present");
    setCurrentAttendanceNotes(checkInData.notes || "");
  }, [user?.name, markMorningCheckIn, toast]);

  const handleCloseMorningCheckInDialog = React.useCallback((saved = false) => {
    setIsMorningCheckInDialogOpen(false);
    if (!saved && user?.name) {
      const todayDateString = format(new Date(), "yyyy-MM-dd");
      sessionStorage.setItem(`morningCheckInAttempted_${user.name}_${todayDateString}`, 'true');
    }
  }, [user?.name]);

  const handleOpenEveningCheckoutDialog = React.useCallback(() => {
    if (!user?.name) return;
    const attendanceRecord = getAttendanceForUserAndDate(user.name, new Date());
    setCurrentAttendanceNotes(attendanceRecord?.notes || "");
    setIsEveningCheckoutDialogOpen(true);
  }, [user?.name, getAttendanceForUserAndDate]);

  const handleSaveEveningCheckout = React.useCallback((checkoutData) => {
    if (!user?.name) return;

    markEveningCheckout(user.name, new Date(), checkoutData);
    toast({
      title: "Checkout Recorded",
      description: `Your check-out for ${format(new Date(), "PPP")} has been recorded.`,
    });

    setIsEveningCheckoutDialogOpen(false);
    setShowCheckoutButton(false);
  }, [user?.name, markEveningCheckout, toast]);

  const contextValue = React.useMemo(() => ({
    showCheckoutButton,
    onCheckoutClick: handleOpenEveningCheckoutDialog,
  }), [showCheckoutButton, handleOpenEveningCheckoutDialog]);

  return (
    <AttendanceContext.Provider value={contextValue}>
      {children}
      <MorningCheckInDialog
        isOpen={isMorningCheckInDialogOpen}
        onClose={handleCloseMorningCheckInDialog}
        onSave={handleSaveMorningCheckIn}
        userName={user?.name}
      />
      <EveningCheckoutDialog
        isOpen={isEveningCheckoutDialogOpen}
        onClose={() => setIsEveningCheckoutDialogOpen(false)}
        onSave={handleSaveEveningCheckout}
        userName={user?.name}
        currentNotes={currentAttendanceNotes}
      />
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = React.useContext(AttendanceContext);
  if (context === null) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
} 