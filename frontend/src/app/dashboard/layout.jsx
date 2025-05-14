"use client"; 

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
// import { AttendanceProvider, useAttendance } from "@/components/attendance/attendance-manager"; // Removed as per prior instruction
import { Skeleton } from "@/components/ui/skeleton";

function DashboardContent({ children, onLogout }) {
  // const { showCheckoutButton, onCheckoutClick } = useAttendance(); // Removed

  return (
    <>
      <AppSidebar 
        // onCheckoutClick={onCheckoutClick}  // Removed
        // showCheckoutButton={showCheckoutButton} // Removed
        onLogout={onLogout}
      />
      <SidebarInset>
        <AppHeader 
          // onCheckoutClick={onCheckoutClick} // Removed
          // showCheckoutButton={showCheckoutButton} // Removed
          onLogout={onLogout} 
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-secondary/40 dark:bg-background">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}

export default function DashboardLayout({
  children,
}) {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading); 
  const authStoreLogout = useAuthStore(state => state.logout);
  const profileData = useProfileStore(state => state.profileData);
  const initializeProfile = useProfileStore(state => state.initializeProfileForUser);

  const [isClientRender, setIsClientRender] = React.useState(false);

  React.useEffect(() => {
    // This effect runs only on the client side, after the component has mounted.
    setIsClientRender(true);
  }, []);


  React.useEffect(() => {
    if (user && (!profileData || profileData.personal.companyEmail !== user.email)) {
      initializeProfile(user);
    }
  }, [user, profileData, initializeProfile]); 

  const handleLogout = React.useCallback(() => {
    authStoreLogout();
    router.push('/login');
  }, [authStoreLogout, router]);
  
  React.useEffect(() => {
    // This effect should only run on the client after isClientRender is true
    // and the auth store has finished its initial loading/rehydration.
    if (isClientRender && !loading && !user && typeof window !== 'undefined' && window.location.pathname !== '/login') {
      router.push('/login');
    }
  }, [isClientRender, loading, user, router]);


  if (!isClientRender || loading) { 
    // Render a consistent loading skeleton.
    // This ensures server render (where loading from store is initially true)
    // and initial client render (before isClientRender is true, or before store rehydrates loading to false) match.
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
  
  // At this point, isClientRender is true and loading (from authStore) is false.
  // We can now safely check for user and redirect if necessary.
  if (!user && typeof window !== 'undefined' && window.location.pathname !== '/login') {
    // The useEffect above has already initiated router.push.
    // Return null to prevent rendering children while redirecting.
    return null; 
  }

  // If user exists, render the dashboard
  if (user) {
    return (
      <SidebarProvider defaultOpen={false}>
        {/* <AttendanceProvider user={user}> // Removed */}
          <DashboardContent onLogout={handleLogout}>
            {children}
          </DashboardContent>
        {/* </AttendanceProvider> // Removed */}
      </SidebarProvider>
    );
  }

  // Fallback for scenarios where user is null and on login page (or SSR where window is undefined initially)
  // Or if not on /login page and !user, but redirect hasn't visually completed.
  return null; 
}
