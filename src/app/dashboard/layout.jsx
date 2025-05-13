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
  }, [user?.email]); // Only depend on user.email to prevent unnecessary re-initialization

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
      <AttendanceProvider user={user}>
        <DashboardContent onLogout={handleLogout}>
          {children}
        </DashboardContent>
      </AttendanceProvider>
    </SidebarProvider>
  );
}
