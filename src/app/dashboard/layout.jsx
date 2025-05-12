
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
import { EveningCheckoutDialog } from "@/components/attendance/evening-checkout-dialog"; // Import EveningCheckoutDialog
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";


export default function DashboardLayout({
  children,
}) {
  const { user, loading } = useMockAuth();
  const router = useRouter();
  const initializeProfile = useProfileStore(state => state.initializeProfileForUser);
  const profileData = useProfileStore(state => state.profileData);

  const { getAttendanceForUserAndDate, markMorningCheckIn, markEveningCheckout } = useAttendanceStore(state => ({ // Added markEveningCheckout
    getAttendanceForUserAndDate: state.getAttendanceForUserAndDate,
    markMorningCheckIn: state.markMorningCheckIn,
    markEveningCheckout: state.markEveningCheckout, 
  }));
  const { toast } = useToast();

  const [isMorningCheckInDialogOpen, setIsMorningCheckInDialogOpen] = React.useState(false);
  const [isEveningCheckoutDialogOpen, setIsEveningCheckoutDialogOpen] = React.useState(false); // State for checkout dialog
  const [currentAttendanceNotes, setCurrentAttendanceNotes] = React.useState("");


  React.useEffect(() => {
    if (user && (!profileData || profileData.personal.companyEmail !== user.email)) {
      initializeProfile(user);
    }
  }, [user, initializeProfile, profileData]);

  React.useEffect(() => {
    if (user && !loading) {
      const today = new Date();
      const todayDateString = format(today, "yyyy-MM-dd");
      const sessionCheckKey = `morningCheckInAttempted_${user.name}_${todayDateString}`;
      
      const alreadyAttempted = sessionStorage.getItem(sessionCheckKey);
      const attendanceRecord = getAttendanceForUserAndDate(user.name, today);

      if ((!attendanceRecord || !attendanceRecord.checkInTimeCategory) && !alreadyAttempted) {
        const currentHour = new Date().getHours();
        if (currentHour < 24) { 
            setIsMorningCheckInDialogOpen(true);
        }
      }
      // Store current notes if attendance record exists, for pre-filling checkout dialog
      if (attendanceRecord?.notes) {
        setCurrentAttendanceNotes(attendanceRecord.notes);
      } else {
        setCurrentAttendanceNotes("");
      }

    }
  }, [user, loading, getAttendanceForUserAndDate]);

  const handleSaveMorningCheckIn = (checkInData) => {
    if (!user) return;
    markMorningCheckIn(user.name, new Date(), checkInData);
    toast({
      title: "Attendance Marked",
      description: `Your check-in for ${format(new Date(), "PPP")} has been recorded.`,
    });
    setIsMorningCheckInDialogOpen(false);
    const todayDateString = format(new Date(), "yyyy-MM-dd");
    sessionStorage.setItem(`morningCheckInAttempted_${user.name}_${todayDateString}`, 'true');
    // Update current notes if check-in had notes
    if (checkInData.notes) {
        setCurrentAttendanceNotes(checkInData.notes);
    }
  };

  const handleCloseMorningCheckInDialog = () => {
    setIsMorningCheckInDialogOpen(false);
    if (user) {
        const todayDateString = format(new Date(), "yyyy-MM-dd");
        sessionStorage.setItem(`morningCheckInAttempted_${user.name}_${todayDateString}`, 'true');
    }
  };

  const handleOpenEveningCheckoutDialog = () => {
    if (!user) return;
    const attendanceRecord = getAttendanceForUserAndDate(user.name, new Date());
    setCurrentAttendanceNotes(attendanceRecord?.notes || ""); // Pre-fill notes
    setIsEveningCheckoutDialogOpen(true);
  };

  const handleSaveEveningCheckout = (checkoutData) => {
    if (!user) return;
    markEveningCheckout(user.name, new Date(), checkoutData);
    toast({
      title: "Checkout Recorded",
      description: `Your check-out for ${format(new Date(), "PPP")} has been recorded.`,
    });
    setIsEveningCheckoutDialogOpen(false);
  };


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
      <AppSidebar onCheckoutClick={handleOpenEveningCheckoutDialog} /> {/* Pass handler to Sidebar if button is there */}
      <SidebarInset>
        <AppHeader onCheckoutClick={handleOpenEveningCheckoutDialog} /> {/* Pass handler to Header */}
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
          currentNotes={currentAttendanceNotes} // Pass current notes
        />
      )}
    </SidebarProvider>
  );
}
