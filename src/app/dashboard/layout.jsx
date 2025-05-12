
"use client"; 

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useMockAuth } from "@/hooks/use-mock-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { useAttendanceStore } from "@/store/attendanceStore"; 
import { MorningCheckInDialog } from "@/components/attendance/morning-check-in-dialog"; 
import { EveningCheckoutDialog } from "@/components/attendance/evening-checkout-dialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";


export default function DashboardLayout({
  children,
}) {
  const { user, loading } = useMockAuth();
  const router = useRouter();
  const initializeProfile = useProfileStore(state => state.initializeProfileForUser);
  const profileData = useProfileStore(state => state.profileData);
  const profileUserEmail = useProfileStore(state => state.profileData?.personal?.companyEmail);


  const { getAttendanceForUserAndDate, markMorningCheckIn, markEveningCheckout } = useAttendanceStore(state => ({ 
    getAttendanceForUserAndDate: state.getAttendanceForUserAndDate,
    markMorningCheckIn: state.markMorningCheckIn,
    markEveningCheckout: state.markEveningCheckout, 
  }));
  const { toast } = useToast();

  const [isMorningCheckInDialogOpen, setIsMorningCheckInDialogOpen] = React.useState(false);
  const [isEveningCheckoutDialogOpen, setIsEveningCheckoutDialogOpen] = React.useState(false); 
  const [currentAttendanceNotes, setCurrentAttendanceNotes] = React.useState("");
  const [showCheckoutButton, setShowCheckoutButton] = React.useState(false);


  React.useEffect(() => {
    if (user && (!profileUserEmail || profileUserEmail !== user.email)) {
      initializeProfile(user);
    }
  }, [user, initializeProfile, profileUserEmail]);

  React.useEffect(() => {
    if (user && !loading) {
      const today = new Date();
      const todayDateString = format(today, "yyyy-MM-dd");
      const sessionCheckKey = `morningCheckInAttempted_${user.name}_${todayDateString}`;
      
      const alreadyAttemptedOrDismissed = sessionStorage.getItem(sessionCheckKey);
      const attendanceRecord = getAttendanceForUserAndDate(user.name, today);

      // Show morning check-in dialog if not checked-in and not dismissed for the day
      if (!attendanceRecord?.checkInTimeCategory && !alreadyAttemptedOrDismissed) {
        setIsMorningCheckInDialogOpen(true);
      } else {
        setIsMorningCheckInDialogOpen(false);
      }

      if (attendanceRecord?.checkInTimeCategory && !attendanceRecord?.checkOutTimeCategory) {
        setShowCheckoutButton(true);
      } else {
        setShowCheckoutButton(false);
      }
      
      setCurrentAttendanceNotes(attendanceRecord?.notes || "");

    }
  }, [user, loading, getAttendanceForUserAndDate, router.pathname]);

  const handleSaveMorningCheckIn = React.useCallback((checkInData) => {
    if (!user) return;
    markMorningCheckIn(user.name, new Date(), checkInData);
    toast({
      title: "Attendance Marked",
      description: `Your check-in for ${format(new Date(), "PPP")} has been recorded.`,
    });
    setIsMorningCheckInDialogOpen(false);
    if (checkInData.status === "Present") {
        setShowCheckoutButton(true); 
    }
    setCurrentAttendanceNotes(checkInData.notes || "");
  }, [user, markMorningCheckIn, toast, setCurrentAttendanceNotes, setShowCheckoutButton]);

  const handleCloseMorningCheckInDialog = React.useCallback((saved = false) => {
    setIsMorningCheckInDialogOpen(false);
    if (!saved && user) { 
        const todayDateString = format(new Date(), "yyyy-MM-dd");
        sessionStorage.setItem(`morningCheckInAttempted_${user.name}_${todayDateString}`, 'true');
    }
  }, [user]);

  const handleOpenEveningCheckoutDialog = React.useCallback(() => {
    if (!user) return;
    const attendanceRecord = getAttendanceForUserAndDate(user.name, new Date());
    setCurrentAttendanceNotes(attendanceRecord?.notes || ""); 
    setIsEveningCheckoutDialogOpen(true);
  }, [user, getAttendanceForUserAndDate]);

  const handleSaveEveningCheckout = React.useCallback((checkoutData) => {
    if (!user) return;
    markEveningCheckout(user.name, new Date(), checkoutData);
    toast({
      title: "Checkout Recorded",
      description: `Your check-out for ${format(new Date(), "PPP")} has been recorded.`,
    });
    setIsEveningCheckoutDialogOpen(false);
    setShowCheckoutButton(false); 
  }, [user, markEveningCheckout, toast, setShowCheckoutButton]);


  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }
  
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar onCheckoutClick={handleOpenEveningCheckoutDialog} showCheckoutButton={showCheckoutButton} />
      <SidebarInset>
        <AppHeader onCheckoutClick={handleOpenEveningCheckoutDialog} showCheckoutButton={showCheckoutButton} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
      {user && (
        <MorningCheckInDialog
            isOpen={isMorningCheckInDialogOpen}
            onClose={handleCloseMorningCheckInDialog}
            onSave={handleSaveMorningCheckIn}
            userName={user.name}
        />
      )}
       {user && (
        <EveningCheckoutDialog
          isOpen={isEveningCheckoutDialogOpen}
          onClose={() => setIsEveningCheckoutDialogOpen(false)}
          onSave={handleSaveEveningCheckout}
          userName={user.name}
          currentNotes={currentAttendanceNotes} 
        />
      )}
    </SidebarProvider>
  );
}
