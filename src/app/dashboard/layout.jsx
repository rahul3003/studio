"use client"; 

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { AttendanceProvider, useAttendance } from "@/components/attendance/attendance-manager";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardContent({ children, onLogout }) {
  const { showCheckoutButton, onCheckoutClick } = useAttendance();

  return (
    <>
      <AppSidebar 
        onCheckoutClick={onCheckoutClick} 
        showCheckoutButton={showCheckoutButton} 
        onLogout={onLogout}
      />
      <SidebarInset>
        <AppHeader 
          onCheckoutClick={onCheckoutClick} 
          showCheckoutButton={showCheckoutButton} 
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

  // Initialize profile only once when user changes
  React.useEffect(() => {
    if (user && (!profileData || profileData.personal.companyEmail !== user.email)) {
      initializeProfile(user);
    }
  }, [user, profileData, initializeProfile]); // Added profileData and initializeProfile to dependencies

  const handleLogout = React.useCallback(() => {
    authStoreLogout();
    router.push('/login');
  }, [authStoreLogout, router]);

  // Moved router.push into useEffect
  React.useEffect(() => {
    if (!loading && !user && typeof window !== 'undefined' && window.location.pathname !== '/login') {
      router.push('/login');
    }
  }, [loading, user, router]);


  if (loading) { 
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
  
  // If not loading and no user, and not on login page, the useEffect above will handle redirect.
  // Render null here to avoid rendering children while redirecting.
  if (!user && typeof window !== 'undefined' && window.location.pathname !== '/login') {
    return null; 
  }

  // If user exists, render the dashboard
  if (user) {
    return (
      <SidebarProvider defaultOpen>
        <AttendanceProvider user={user}>
          <DashboardContent onLogout={handleLogout}>
            {children}
          </DashboardContent>
        </AttendanceProvider>
      </SidebarProvider>
    );
  }

  // Fallback for scenarios where user is null and on login page (or SSR where window is undefined initially)
  return null; 
}

