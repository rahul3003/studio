
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
  const loading = useAuthStore(state => state.loading); // authIsLoading
  const authStoreLogout = useAuthStore(state => state.logout);

  const storeInitializeProfile = useProfileStore(state => state.initializeProfileForUser);
  const profileData = useProfileStore(state => state.profileData);
  
  const getAttendanceForUserAndDate = useAttendanceStore(state => state.getAttendanceForUserAndDate);
  const markMorningCheckIn = useAttendanceStore(state => state.markMorningCheckIn);
  const markEveningCheckout = useAttendanceStore(state => state.markEveningCheckout);
  
  const { toast } = useToast();

  const [isMorningCheckInDialogOpen, setIsMorningCheckInDialogOpen] = React.useState(false);
  const [isEveningCheckoutDialogOpen, setIsEveningCheckoutDialogOpen] = React.useState(false); 
  const [currentAttendanceNotes, setCurrentAttendanceNotes] = React.useState("");
  const [showCheckoutButton, setShowCheckoutButton] = React.useState(false);

  // Memoize initializeProfile to ensure stable reference if needed, though Zustand actions are typically stable.
  const initializeProfile = React.useCallback((userData) => {
    storeInitializeProfile(userData);
  }, [storeInitializeProfile]);


  React.useEffect(() => {
    // Initialize profile only when user is loaded and not in auth loading state
    if (user && user.email && !loading) {
      if (!profileData || !profileData.personal || profileData.personal.companyEmail !== user.email) {
        initializeProfile(user);
      }
    }
  }, [user, loading, initializeProfile, profileData]);

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

  const handleLogout = () => {
    authStoreLogout();
    router.push('/login');
  };


  if (loading || (!user && typeof window !== 'undefined' && window.location.pathname !== '/login')) { 
    // If still loading, or no user and not on login page, show skeleton or redirect.
    // The redirect to /login should be handled by useMockAuth or similar hook if not loading and no user.
    // Here, we primarily show skeleton during the loading phase.
    if (typeof window !== 'undefined' && window.location.pathname !== '/login' && !user && !loading) {
        router.push('/login'); // Ensure redirect if not loading and no user.
        return null; // Prevent rendering children during redirect.
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
  
  // If user is null and we are on a protected route (not /login), redirecting should occur.
  // This might be better handled in a dedicated auth guard component or higher up.
  // For now, the check above tries to manage it.

  if (!user) {
    // This case implies loading is false, but user is still null.
    // This should ideally not happen on protected routes if redirection logic is correct.
    // If on /login, LoginForm handles it.
    // If on other routes, it means redirection failed or is pending.
    return null; // Or a more specific loading/redirecting indicator.
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
