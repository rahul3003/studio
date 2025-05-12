
"use client"; 

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { useAttendanceStore } from "@/store/attendanceStore"; 
import { MorningCheckInDialog } from "@/components/attendance/morning-check-in-dialog"; 
import { EveningCheckoutDialog } from "@/components/attendance/evening-checkout-dialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";


export default function DashboardLayout({
  children,
}) {
  const router = useRouter();

  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading); 
  const authStoreLogout = useAuthStore(state => state.logout);

  const storeInitializeProfile = useProfileStore(state => state.initializeProfileForUser);
  // No longer selecting profileData here directly if it causes issues in useEffect dependency.
  // const profileData = useProfileStore(state => state.profileData); 
  
  const getAttendanceForUserAndDate = useAttendanceStore(state => state.getAttendanceForUserAndDate);
  const markMorningCheckIn = useAttendanceStore(state => state.markMorningCheckIn);
  const markEveningCheckout = useAttendanceStore(state => state.markEveningCheckout);
  
  const { toast } = useToast();

  const [isMorningCheckInDialogOpen, setIsMorningCheckInDialogOpen] = React.useState(false);
  const [isEveningCheckoutDialogOpen, setIsEveningCheckoutDialogOpen] = React.useState(false); 
  const [currentAttendanceNotes, setCurrentAttendanceNotes] = React.useState("");
  const [showCheckoutButton, setShowCheckoutButton] = React.useState(false);

  const initializeProfile = React.useCallback((userData) => {
    storeInitializeProfile(userData);
  }, [storeInitializeProfile]);


  React.useEffect(() => {
    if (user && user.email && !loading) {
      // Directly get current profile data from store for the check to avoid dependency loop
      const currentProfileInStore = useProfileStore.getState().profileData;
      if (!currentProfileInStore || !currentProfileInStore.personal || currentProfileInStore.personal.companyEmail !== user.email) {
        initializeProfile(user);
      }
    }
  }, [user, loading, initializeProfile]); // Removed profileData from dependencies

  React.useEffect(() => {
    if (user && !loading) {
      const today = new Date();
      const todayDateString = format(today, "yyyy-MM-dd");
      const sessionCheckKey = `morningCheckInAttempted_${user.name}_${todayDateString}`;
      
      const alreadyAttemptedOrDismissed = sessionStorage.getItem(sessionCheckKey);
      const attendanceRecord = getAttendanceForUserAndDate(user.name, today);

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
  }, [user, loading, getAttendanceForUserAndDate]); 

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
  }, [user, markMorningCheckIn, toast]); 

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
  }, [user, markEveningCheckout, toast]);

  const handleLogout = React.useCallback(() => {
    authStoreLogout();
    router.push('/login');
  }, [authStoreLogout, router]);


  if (loading || (!user && typeof window !== 'undefined' && window.location.pathname !== '/login')) { 
    if (typeof window !== 'undefined' && window.location.pathname !== '/login' && !user && !loading) {
        router.push('/login'); 
        return null; 
    }
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full bg-muted" />
          <Skeleton className="h-4 w-[250px] bg-muted" />
          <Skeleton className="h-4 w-[200px] bg-muted" />
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; 
  }
  
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar onCheckoutClick={handleOpenEveningCheckoutDialog} showCheckoutButton={showCheckoutButton} onLogout={handleLogout}/>
      <SidebarInset>
        <AppHeader onCheckoutClick={handleOpenEveningCheckoutDialog} showCheckoutButton={showCheckoutButton} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-secondary/40 dark:bg-background">
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
